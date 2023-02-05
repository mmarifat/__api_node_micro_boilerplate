import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [`.env`],
            validationSchema: Joi.object({
                APP_PORT: Joi.string().required(),
                DATABASE: Joi.string().required(),
                ACCESS_SECRET: Joi.string().required(),
                REFRESH_SECRET: Joi.string().required(),
                RESET_SECRET: Joi.string().required(),
                REDIS_SESSION: Joi.string().required(),
                RABBIT_MQ_URI: Joi.string().required(),
                RABBIT_MQ_AUTH_QUEUE: Joi.string().required(),
            }),
        }),
    ],
})
export class EnvConfigModule {}
