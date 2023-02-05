import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { ENUMS } from '@packages/enums';
import RedisClientEnum = ENUMS.RedisClientEnum;
import RedisDataEnum = ENUMS.RedisDataEnum;

@Injectable()
export class HttpAtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly configService: ConfigService, private readonly redisService: RedisService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKeyProvider: async (__request: Request, rawJwtToken: any, done: (err: any, secretOrKey?: string | Buffer) => void) => {
                let blacklist = await redisService.getClient(RedisClientEnum.REDIS_SESSION).get(RedisDataEnum.ACCESS_TOKEN_BLACKLIST);
                blacklist = JSON.parse(blacklist || '[]');
                if (blacklist.indexOf(rawJwtToken) !== -1) {
                    done('Blocked AccessToken', null);
                } else {
                    done(null, configService.get<string>('ACCESS_SECRET'));
                }
            },
        });
    }

    async validate(payload: any) {
        return { ...payload };
    }
}
