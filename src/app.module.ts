import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { publicUrls } from './public.url';
import { EnvConfigModule } from './package/config-modules/env-config.module';
import { MongoConfigModule } from './package/config-modules/mongo-config.module';
import { JwtRequestMiddleware } from './package/middlewares/jwt-request.middleware';
import { RedisConfigModule } from './package/config-modules/redis-config.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogInterceptor } from './package/interceptors/log.interceptor';
import { AuthVerifyMiddleware } from './package/middlewares/auth-verify.middleware';
import { CommonServiceModule } from './package/config-modules/common-service.module';
import { MongooseModule } from '@nestjs/mongoose';
import LogSchema, { LogEntity } from './package/colllections/schemas/log.schema';
import { CollectionEnum } from './package/enums/collection.enum';
import { UserAuthModule } from './api/user/user-auth.module';
import { UploadModule } from './api/upload/upload.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

const collectionModules = [UserAuthModule, UploadModule];

@Module({
    imports: [
        EnvConfigModule,
        MongoConfigModule,
        RedisConfigModule,
        CommonServiceModule,
        EventEmitterModule.forRoot(),
        MongooseModule.forFeature([
            {
                name: LogEntity.name,
                schema: LogSchema,
                collection: CollectionEnum.LOGS,
            },
        ]),
        ...collectionModules,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LogInterceptor,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(JwtRequestMiddleware).forRoutes('*');
        consumer
            .apply(AuthVerifyMiddleware)
            .exclude(...publicUrls)
            .forRoutes('*');
    }
}
