import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Types } from 'mongoose';
import * as hcaptcha from 'hcaptcha';
import { RpcSystemException } from '@packages/exceptions';
import { BcryptService, ExceptionService, MongoService, RequestService } from '@packages/services';
import { ForgotPasswordEmailDto, LoginDto, LoginHistoryArrayDto, LoginHistoryDto, ProfileDto, TokenDto, UserDto } from '@packages/dto/auth';
import { LoginHistoryDocument, LoginHistorySchema, ProfileDocument, ProfileSchema, UserDocument, UserSchema } from '@packages/schemas';
import {
    en_US_Collation,
    posfAggregate,
    stringToMongoId,
    userToProfileAggregate,
    withoutDeletedAggregate,
    withoutDeletedMongoose,
} from '@packages/mongo';
import { ENUMS } from '@packages/enums';
import { IoDtos } from '@packages/dto/core';
import { JwtHttpRequest } from '@packages/interfaces';
import CollectionEnum = ENUMS.PROJECT.CollectionEnum;
import RedisEnum = ENUMS.RedisClientEnum;
import DeleteDto = IoDtos.DeleteDto;
import RedisDataEnum = ENUMS.RedisDataEnum;

@Injectable()
export class MicroAuthService {
    constructor(
        private readonly mongoService: MongoService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly bcryptService: BcryptService,
        private readonly exceptionService: ExceptionService,
        private readonly requestService: RequestService,
        private readonly redisService: RedisService,
    ) {}

    async login(loginInput: LoginDto, ip: any): Promise<TokenDto> {
        try {
            const user = await this.validateUser(loginInput);
            const token = await this.generateToken(loginInput.isRemembered, user._id);
            this.addLoginHistory(user._id, ip);
            return token;
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }

    async forgotPasswordEmail(forgotPasswordInput: ForgotPasswordEmailDto): Promise<string> {
        try {
            const user: UserDocument = await this.mongoService
                .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
                .findOne(
                    {
                        email: forgotPasswordInput.email,
                        ...withoutDeletedMongoose,
                    },
                    {
                        password: 0,
                        hashedRt: 0,
                    },
                )
                .lean();
            this.exceptionService.rpcNotFound(user, 'No such user found!!');

            //TODO:: need to send mail in here
            return null;
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }

    async resetPasswordEmail(token: string, newPassword: string): Promise<boolean> {
        try {
            let blacklist: string | Array<string> = await this.redisService
                .getClient(RedisEnum.REDIS_SESSION)
                .get(RedisDataEnum.RESET_PASSWORD_BLACKLIST);
            blacklist = JSON.parse(blacklist || '[]');
            if (blacklist.includes(token)) this.exceptionService.rpcException(HttpStatus.FORBIDDEN, 'Invalid Token! Used already!!');

            const verified: any = await this.jwtService
                .verifyAsync(token, { secret: this.configService.get<string>('RESET_SECRET') })
                .catch(() => {
                    return this.exceptionService.rpcException(HttpStatus.FORBIDDEN, 'Reset Link Expired! Try again!!');
                });
            if (verified?._id) {
                const user = await this.mongoService
                    .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
                    .findOne(
                        {
                            _id: verified?._id,
                            ...withoutDeletedMongoose,
                        },
                        {
                            password: 1,
                            _id: 1,
                        },
                    )
                    .lean();

                const samePassword = await this.bcryptService.comparePassword(newPassword, user.password);
                if (samePassword) this.exceptionService.rpcException(HttpStatus.FORBIDDEN, `New Password can't be previous password!!`);

                const updated = await this.mongoService
                    .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
                    .updateOne(
                        {
                            _id: verified?._id,
                            ...withoutDeletedMongoose,
                        },
                        {
                            password: await this.bcryptService.hashPassword(newPassword),
                            hashedRt: null,
                        },
                        {
                            new: true,
                        },
                    )
                    .lean();
                if (typeof blacklist !== 'string') {
                    blacklist.push(token);
                    await this.redisService
                        .getClient(RedisEnum.REDIS_SESSION)
                        .set(
                            RedisDataEnum.RESET_PASSWORD_BLACKLIST,
                            JSON.stringify(blacklist),
                            'EX',
                            parseInt(String((verified['exp'] * 1000 - Date.now()) / 1000)),
                        );
                }
                return !!updated;
            }
            this.exceptionService.rpcException(HttpStatus.FORBIDDEN, 'Reset Link Expired! Try again!!');
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }

    async register(userInput: UserDto): Promise<UserDocument> {
        try {
            if (userInput.email) {
                const emailCount = await this.mongoService
                    .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
                    .findOne({ email: userInput.email })
                    .count()
                    .lean();
                if (!!emailCount) this.exceptionService.rpcException(HttpStatus.BAD_REQUEST, 'Email already exists!!');
            }

            if (typeof userInput.profile !== 'object') {
                userInput.profile = new ProfileDto();
            }
            const createdProfile = await this.mongoService
                .rpcGetModel<ProfileDocument>({ schema: ProfileSchema, collection: CollectionEnum.PROFILES })
                .create(userInput.profile);
            userInput.profile = createdProfile._id;

            userInput.password = await this.bcryptService.hashPassword(userInput?.password || '123456');
            userInput = this.requestService.createdBy<UserDto>(null, userInput);
            const createdUser = await this.mongoService
                .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
                .create(userInput);

            return this.getUserById(createdUser._id);
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }

    async logout(jwtUser: JwtHttpRequest): Promise<boolean> {
        try {
            await this.mongoService
                .rpcGetModel<UserDocument>({
                    schema: UserSchema,
                    collection: CollectionEnum.USERS,
                })
                .findOneAndUpdate(
                    {
                        _id: jwtUser._id,
                        hashedRt: { $ne: null },
                    },
                    { $set: { hashedRt: null } },
                    { new: true },
                );
            let blacklist = await this.redisService.getClient(RedisEnum.REDIS_SESSION).get(RedisDataEnum.ACCESS_TOKEN_BLACKLIST);
            blacklist = JSON.parse(blacklist || '[]');
            blacklist = JSON.stringify([...blacklist, jwtUser.__accessToken]);
            this.redisService
                .getClient(RedisEnum.REDIS_SESSION)
                .set(
                    RedisDataEnum.ACCESS_TOKEN_BLACKLIST,
                    blacklist,
                    'EX',
                    parseInt(String((jwtUser['exp'] * 1000 - Date.now()) / 1000)) /*timeRemainingInSeconds*/,
                );
            return Promise.resolve(true);
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }

    async refreshToken(jwtUser: JwtHttpRequest): Promise<TokenDto> {
        try {
            const foundUser = await this.mongoService
                .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
                .findById(jwtUser._id);
            if (!foundUser.hashedRt) this.exceptionService.rpcException(HttpStatus.NOT_ACCEPTABLE, 'User not found!!');
            const rtMatch = await this.bcryptService.comparePassword(jwtUser.__refreshToken, foundUser.hashedRt);
            if (!rtMatch) this.exceptionService.rpcException(HttpStatus.NOT_ACCEPTABLE, 'Refresh token not matched!!');

            let blacklist = await this.redisService.getClient(RedisEnum.REDIS_SESSION).get(RedisDataEnum.REFRESH_TOKEN_BLACKLIST);
            blacklist = JSON.parse(blacklist || '[]');
            blacklist = JSON.stringify([...blacklist, jwtUser.__refreshToken]);
            this.redisService
                .getClient(RedisEnum.REDIS_SESSION)
                .set(
                    RedisDataEnum.REFRESH_TOKEN_BLACKLIST,
                    blacklist,
                    'EX',
                    parseInt(String((jwtUser['exp'] * 1000 - Date.now()) / 1000)) /*timeRemainingInSeconds*/,
                );

            return this.generateToken(0, foundUser._id);
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }

    async getUserInfo(userId: Types.ObjectId | string = null): Promise<UserDocument> {
        try {
            const found = await this.getUserById(userId.toString());
            this.exceptionService.rpcNotFound(found, 'User not found!!');
            return found;
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }

    async updateUser(userId: string, userDto: UserDto): Promise<UserDocument> {
        try {
            const found = await this.mongoService
                .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
                .findOne({
                    _id: userId,
                    ...withoutDeletedMongoose,
                })
                .lean();
            this.exceptionService.rpcNotFound(found, 'Wrong user!!');
            await this.mongoService
                .rpcGetModel<UserDocument>({
                    schema: UserSchema,
                    collection: CollectionEnum.USERS,
                })
                .updateOne(
                    {
                        _id: userId,
                        ...withoutDeletedMongoose,
                    },
                    {
                        ...found,
                        ...userDto,
                    },
                    { new: true },
                );
            return await this.getUserById(userId);
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }

    async posf(page: number, limit: number, sort: string, order: string, search: string): Promise<[UserDocument[], number]> {
        try {
            return await Promise.all([
                this.mongoService
                    .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
                    .aggregate(
                        [...posfAggregate(page, limit, sort, order, search, ['username', 'email']), ...userToProfileAggregate],
                        en_US_Collation,
                    ),
                this.mongoService
                    .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
                    .count({
                        ...withoutDeletedMongoose,
                    })
                    .lean(),
            ]);
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }

    async hcaptchaVerify(hcaptchaToken: string): Promise<{ hcaptcha: VerifyResponse }> {
        try {
            if (!hcaptchaToken) this.exceptionService.rpcException(HttpStatus.BAD_REQUEST, 'Bad request - no token provided in body');
            return hcaptcha
                .verify(this.configService.get<string>('HCAPTCHA_SECRET'), hcaptchaToken)
                .then((data) => {
                    if (!data.success) this.exceptionService.rpcException(HttpStatus.BAD_REQUEST, `Bad request - ${data['error-codes']}`);
                    return { hcaptcha: data };
                })
                .catch((e) => {
                    throw new RpcSystemException(e);
                });
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }

    async remove(userId: string): Promise<DeleteDto> {
        try {
            const found = await this.mongoService
                .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
                .findOne({
                    _id: userId,
                    ...withoutDeletedMongoose,
                })
                .lean();
            this.exceptionService.rpcNotFound(found, 'User not found!');
            const deleted = await this.mongoService
                .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
                .findByIdAndUpdate(
                    userId,
                    {
                        deletedAt: new Date(),
                    },
                    {
                        new: true,
                    },
                )
                .lean();
            return new DeleteDto(!!deleted);
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }

    /*************** custom () **********/
    getUserById = async (userId: string): Promise<UserDocument> => {
        const found: UserDocument[] = await this.mongoService
            .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
            .aggregate([
                {
                    $match: { _id: stringToMongoId(userId) },
                },
                ...userToProfileAggregate,
            ]);
        found.length = 1;
        return found[0];
    };

    validateUser = async (loginInput: LoginDto): Promise<UserDocument> => {
        const user: UserDocument = await this.mongoService
            .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
            .findOne({
                $or: [{ email: loginInput.username }, { username: loginInput.username }],
                ...withoutDeletedMongoose,
            })
            .lean();
        this.exceptionService.rpcNotFound(user, 'No such user found!!');
        await this.validateUserPassword(loginInput.password, user.password);
        return user;
    };

    validateUserPassword = async (givenPassword: string, hashPassword: string) => {
        const isPasswordMatched = await this.bcryptService.comparePassword(givenPassword, hashPassword);
        if (!isPasswordMatched) this.exceptionService.rpcException(HttpStatus.BAD_REQUEST, 'User password is not valid');
    };

    generateToken = async (isRemembered: number, userId): Promise<TokenDto> => {
        const user: UserDocument[] = await this.mongoService
            .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
            .aggregate([
                {
                    $match: {
                        _id: stringToMongoId(userId),
                    },
                },
                withoutDeletedAggregate,
                { $limit: 1 },
                {
                    $project: {
                        createdBy: 0,
                        updatedBy: 0,
                        createdAt: 0,
                        updatedAt: 0,
                    },
                },
                ...userToProfileAggregate,
            ]);
        if (user[0].hasOwnProperty('deletedAt')) delete user[0]['deletedAt'];

        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                { ...user[0] },
                {
                    secret: this.configService.get<string>('ACCESS_SECRET'),
                    // isRemember for 24 hours vs 1 hour
                    expiresIn: isRemembered ? 60 * 60 * 24 : 60 * 60,
                },
            ),
            this.jwtService.signAsync(
                { ...user[0] },
                {
                    secret: this.configService.get<string>('REFRESH_SECRET'),
                    expiresIn: isRemembered ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
                },
            ),
        ]);
        await this.updateHashedRt(user[0]._id, rt);
        return {
            accessToken: at,
            refreshToken: rt,
        };
    };

    updateHashedRt = async (userId: Types.ObjectId | string, refreshToken: string) => {
        const hashedRt = await this.bcryptService.hashPassword(refreshToken);
        try {
            await this.mongoService
                .rpcGetModel<UserDocument>({ schema: UserSchema, collection: CollectionEnum.USERS })
                .findByIdAndUpdate(userId, { $set: { hashedRt } }, { new: true })
                .lean();
        } catch (e) {}
    };

    addLoginHistory = async (userId: Types.ObjectId, remoteAddress: any) => {
        const enableHistory = this.configService.get<string>('ENABLE_LOGIN_HISTORY');
        if (enableHistory === 'true') {
            const loginHistory = new LoginHistoryDto();
            loginHistory.userId = userId;

            const loginHistoryArray = new LoginHistoryArrayDto();
            loginHistoryArray.date = new Date();
            loginHistoryArray.remoteAddress = remoteAddress;

            await this.mongoService
                .rpcGetModel<LoginHistoryDocument>({
                    schema: LoginHistorySchema,
                    collection: CollectionEnum.LOGIN_HISTORIES,
                })
                .findOneAndUpdate(
                    {
                        userId: loginHistory.userId.toString(),
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
                .lean();
        }
    };
}
