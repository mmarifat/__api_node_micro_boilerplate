import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { RedisService } from 'nestjs-redis';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { SystemErrorDto } from '../dtos/response/system-error.dto';
import { ErrorDto } from '../dtos/response/error.dto';
import { ResponseDto } from '../dtos/response/response.dto';
import { RedisEnum } from '../enums/redis.enum';

@Injectable()
export class AuthVerifyMiddleware implements NestMiddleware {
    constructor(private readonly configService: ConfigService, private readonly redisService: RedisService) {}

    private static toResponse(res: Response, message: string): Response {
        const systemErrorDto = new SystemErrorDto('UNAUTHORIZED', 'Error', message);
        const errorDto = new ErrorDto(null, systemErrorDto);

        const responseDto = new ResponseDto(new Date().getTime(), HttpStatus.UNAUTHORIZED, message, errorDto, null);

        return res.status(HttpStatus.UNAUTHORIZED).json(responseDto);
    }

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.headers['authorization']?.split('Bearer ')[1];

            if (!token) {
                return AuthVerifyMiddleware.toResponse(res, 'Token is not found in request header');
            }

            const privateKEY = fs.readFileSync('env/jwtRS256.key');

            jwt.verify(token, privateKEY, async (err) => {
                if (err) {
                    return AuthVerifyMiddleware.toResponse(res, 'Token is invalid!!');
                } else {
                    const now = Math.floor(new Date().getTime() / 1000);

                    // get last login timestamp from redis
                    const loggedTime = Number(await this.redisService.getClient(RedisEnum.REDIS_TOKEN_LOGGED_TIME).get(token));

                    // update timestamp in redis
                    await this.redisService.getClient(RedisEnum.REDIS_TOKEN_LOGGED_TIME).set(token, now);

                    const expire = now - loggedTime;

                    const timeout = this.configService.get<number>('TOKEN_EXPIRE_TIME') || 3600;

                    if (expire > timeout) {
                        await this.redisService.getClient(RedisEnum.REDIS_SESSION).expire(token, 0);

                        await this.redisService.getClient(RedisEnum.REDIS_TOKEN_LOGGED_TIME).expire(token, 0);

                        return AuthVerifyMiddleware.toResponse(res, 'Expired due to inactivity');
                    } else {
                        next();
                    }
                }
            });
        } catch (error) {
            return AuthVerifyMiddleware.toResponse(res, 'Authorization is denied');
        }
    }
}
