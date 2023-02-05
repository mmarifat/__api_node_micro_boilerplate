import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ENUMS } from '@packages/enums';
import RedisEnum = ENUMS.RedisClientEnum;

@Global()
@Module({
    imports: [
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                config: [
                    {
                        url: configService.get(RedisEnum.REDIS_SESSION),
                        namespace: RedisEnum.REDIS_SESSION,
                    },
                ],
            }),
        }),
    ],
})
export class RedisConfigModule {}
