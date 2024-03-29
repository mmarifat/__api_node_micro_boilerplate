import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpFieldExceptionFilter, HttpSystemExceptionFilter } from '@packages/exceptions/http/filters';
import { CommonServiceModule, EnvConfigModule, MongoConfigModule, PostgresConfigModule, RedisConfigModule } from '@packages/modules';
import { LogInterceptor } from '@packages/interceptors/http';
import { HttpAtGuard } from '@packages/guards/http';
import { TapMiddleware } from '@packages/middlewares';
import { HealthModule } from '@gateway/src/heath';
import { AuthModule } from '@gateway/src/micro-auth/auth';
import { ProfileModule } from '@gateway/src/micro-auth/profile';

const collectionModules = [HealthModule, AuthModule, ProfileModule];

@Module({
    imports: [EnvConfigModule, CommonServiceModule, MongoConfigModule, PostgresConfigModule, RedisConfigModule, ...collectionModules],
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpSystemExceptionFilter,
        },
        {
            provide: APP_FILTER,
            useClass: HttpFieldExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: LogInterceptor,
        },
        {
            provide: APP_GUARD,
            useClass: HttpAtGuard,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(TapMiddleware).forRoutes('*');
    }
}
