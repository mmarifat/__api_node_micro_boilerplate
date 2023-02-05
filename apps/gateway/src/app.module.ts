import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CommonServiceModule, EnvConfigModule, MongoConfigModule, RedisConfigModule } from '@packages/modules';
import { AuthModule } from '@gateway/src/auth';
import { ProfileModule } from '@gateway/src/profile';
import { LogInterceptor } from '@packages/interceptors/http';
import { HttpAtGuard } from '@packages/guards/http';
import { TapMiddleware } from '@packages/middlewares';

const collectionModules = [AuthModule, ProfileModule];

@Module({
    imports: [EnvConfigModule, CommonServiceModule, MongoConfigModule, RedisConfigModule, ...collectionModules],
    providers: [
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
