import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';
import { RedisEnum } from '../enums/redis.enum';

@Global()
@Module({
    imports: [
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => [
                {
                    url: configService.get(RedisEnum.REDIS_SESSION),
                    name: 'REDIS_SESSION',
                },
                {
                    url: configService.get(RedisEnum.REDIS_TMP_FILE),
                    name: 'REDIS_TMP_FILE',
                },
                {
                    url: configService.get(RedisEnum.REDIS_TOKEN_LOGGED_TIME),
                    name: 'REDIS_TOKEN_LOGGED_TIME',
                },
            ],
        }),
    ],
})
export class RedisConfigModule {}
