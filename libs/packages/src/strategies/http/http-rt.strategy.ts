import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { ENUMS } from '@packages/enums';
import RedisDataEnum = ENUMS.RedisDataEnum;
import RedisClientEnum = ENUMS.RedisClientEnum;

@Injectable()
export class HttpRtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private readonly configService: ConfigService, private readonly redisService: RedisService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            passReqToCallback: true,
            secretOrKeyProvider: async (__request: Request, rawJwtToken: any, done: (err: any, secretOrKey?: string | Buffer) => void) => {
                let blacklist = await redisService.getClient(RedisClientEnum.REDIS_SESSION).get(RedisDataEnum.REFRESH_TOKEN_BLACKLIST);
                blacklist = JSON.parse(blacklist || '[]');
                if (blacklist.indexOf(rawJwtToken) !== -1) {
                    done('Blocked RefreshToken', null);
                } else {
                    done(null, configService.get<string>('REFRESH_SECRET'));
                }
            },
        });
    }

    async validate(req: Request, payload: any) {
        return { ...payload, refreshToken: req.get('authorization').replace('Bearer ', '').trim() };
    }
}
