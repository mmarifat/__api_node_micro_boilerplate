import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { RedisService } from 'nestjs-redis';
import { RedisEnum } from '../enums/redis.enum';

@Injectable()
export class JwtRequestMiddleware implements NestMiddleware {
    private readonly logger = new Logger(JwtRequestMiddleware.name);

    constructor(private readonly configService: ConfigService, private readonly redisService: RedisService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.headers['authorization']?.split('Bearer ')[1];
            if (token) {
                const payload = await this.redisService.getClient(RedisEnum.REDIS_SESSION).get(token);
                if (payload) req['__auth_user'] = JSON.parse(payload);
            }
            next();
        } catch (error) {
            this.logger.log(error);
        }
    }
}
