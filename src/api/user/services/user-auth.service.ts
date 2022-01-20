import { HttpStatus, Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { TokenDto } from '../../../package/dtos/token.dto';
import { LoginDto } from '../../../package/dtos/login.dto';
import { UserAuthDto } from '../../../package/colllections/dtos/user-auth.dto';
import { ExceptionService } from '../../../package/services/exception.service';
import { JwtRequestService } from '../../../package/services/jwt-request.service';
import { UserAuthDocument, UserAuthEntity } from '../../../package/colllections/schemas/user-auth.schema';
import { LoginHistoryDocument, LoginHistoryEntity } from '../../../package/colllections/schemas/login-history.schema';
import { BcryptService } from '../../../package/services/bcrypt-js.service';
import { SystemException } from '../../../package/exceptions/system.exception';
import { RedisService } from 'nestjs-redis';
import { RedisEnum } from '../../../package/enums/redis.enum';
import { LoginHistoryArrayDto, LoginHistoryDto } from '../../../package/colllections/dtos/login-history.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserAuthService {
    constructor(
        @InjectModel(UserAuthEntity.name)
        private readonly userModel: Model<UserAuthDocument>,
        @InjectModel(LoginHistoryEntity.name)
        private readonly loginHistoryModel: Model<LoginHistoryDocument>,
        private readonly bcryptService: BcryptService,
        private readonly exceptionService: ExceptionService,
        private readonly jwtRequestService: JwtRequestService,
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
    ) {}

    register = async (userInput: UserAuthDto): Promise<UserAuthDocument> => {
        try {
            // error first callbacks for registration
            if (userInput.email && userInput.phone) {
                this.exceptionService.exception(HttpStatus.BAD_REQUEST, 'Only phone or only email should be in the registration payload!!');
            } else {
                if (userInput.email) {
                    const emailCount = await this.userModel.findOne({ email: userInput.email }).count().exec();
                    if (!!emailCount) {
                        this.exceptionService.exception(HttpStatus.BAD_REQUEST, 'Email already exists!!');
                    }
                } else {
                    const phoneCount = await this.userModel.findOne({ phone: userInput.phone }).count().exec();
                    if (!!phoneCount) {
                        this.exceptionService.exception(HttpStatus.BAD_REQUEST, 'Phone already exists!!');
                    }
                }
            }
            // condition check success now continue with registration
            userInput.password = await this.bcryptService.hashPassword(userInput.password);
            userInput = this.jwtRequestService.createdBy<UserAuthDto>(userInput);
            const createdUser = await this.userModel.create(userInput);
            // lean() for faster access
            return await this.userModel
                .findById(createdUser._id, {
                    password: 0,
                })
                .lean();
        } catch (e) {
            throw new SystemException(e);
        }
    };

    login = async (loginInput: LoginDto): Promise<TokenDto> => {
        const user = await this.validateUser(loginInput);
        try {
            const __auth_user = {
                _id: user._id,
                isActive: user.isActive,
                phone: user.phone,
                email: user.email,
                createdBy: user.createdBy,
                createdAt: user['createdAt'],
                updatedAt: user['updatedAt'],
                password: undefined,
            };
            const token = this.generateToken(loginInput.isRemembered, <UserAuthDocument>(__auth_user as unknown));
            // set token and timeout into redis start with 0 second as loggedTime
            await this.redisService.getClient(RedisEnum.REDIS_SESSION).set(token.accessToken, JSON.stringify(__auth_user));

            await this.redisService
                .getClient(RedisEnum.REDIS_TOKEN_LOGGED_TIME)
                .set(token.accessToken, Math.floor(new Date().getTime() / 1000));
            // set token and timeout into redis end
            this.addLoginHistory(user._id);
            return token;
        } catch (e) {
            throw new SystemException(e);
        }
    };

    /*************** custom () **********/
    validateUser = async (loginInput: LoginDto): Promise<UserAuthDocument> => {
        const user: UserAuthDocument = await this.userModel
            .findOne({
                $or: [{ email: loginInput.userName }, { phone: loginInput.userName }],
            })
            .lean();
        this.exceptionService.notFound(user, 'No such user found!!');
        await this.validatePassword(loginInput.password, user.password);
        return user;
    };

    validatePassword = async (givenPassword: string, hashPassword: string): Promise<void> => {
        const isPasswordMatched = await this.bcryptService.comparePassword(givenPassword, hashPassword);
        if (!isPasswordMatched) {
            this.exceptionService.exception(HttpStatus.BAD_REQUEST, 'User password is not valid');
        }
    };

    generateToken = (isRemembered: number, user: UserAuthDocument): TokenDto => {
        const privateKEY = fs.readFileSync('env/jwtRS256.key');
        const token = new TokenDto();
        token.accessToken = jwt.sign({ ...user }, privateKEY, {
            expiresIn: Number(isRemembered) === 1 ? '1d' : '1h',
        });
        const timeOut = Number(isRemembered) === 1 ? 24 : 1;
        token.timeout = new Date(new Date().getTime() + timeOut * 60 * 60 * 1000);
        return token;
    };

    addLoginHistory = (userId: Types.ObjectId) => {
        const enableHistory = this.configService.get<string>('ENABLE_LOGIN_HISTORY');
        if (enableHistory === 'true') {
            const loginHistory = new LoginHistoryDto();
            loginHistory.userId = new Types.ObjectId(userId);

            const loginHistoryArray = new LoginHistoryArrayDto();
            loginHistoryArray.date = new Date();
            loginHistoryArray.remoteAddress = this.jwtRequestService.req().socket.remoteAddress;

            this.loginHistoryModel
                .updateOne(
                    {
                        userId: loginHistory.userId,
                    },
                    {
                        userId: loginHistory.userId,
                        $push: {
                            history: loginHistoryArray,
                        },
                    },
                    {
                        upsert: true,
                    },
                )
                .exec();
        }
    };
}
