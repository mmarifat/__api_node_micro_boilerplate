import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CommonServiceModule, EnvConfigModule, MongoConfigModule, RedisConfigModule, RmqConfigModule } from '@packages/modules';
import { MicroAuthController, MicroAuthService } from '@auth/src/auth';
import { MicroProfileController, MicroProfileService } from '@auth/src/profile';

@Module({
    imports: [EnvConfigModule, MongoConfigModule, RmqConfigModule, CommonServiceModule, RedisConfigModule, JwtModule.register({})],
    controllers: [MicroAuthController, MicroProfileController],
    providers: [MicroAuthService, MicroProfileService],
})
export class MicroAuthModule {}
