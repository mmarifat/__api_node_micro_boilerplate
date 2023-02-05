import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpAtStrategy, HttpRtStrategy } from '@packages/strategies/http';
import { AuthController } from '@gateway/src/auth/auth.controller';
import { RmqConfigModule } from '@packages/modules';
import { ENUMS } from '@packages/enums';
import MicroserviceEnum = ENUMS.MICROSERVICE.MicroserviceEnum;

@Global()
@Module({
    imports: [
        JwtModule.register({}),
        RmqConfigModule.register({
            name: MicroserviceEnum.AUTH,
        }),
    ],
    controllers: [AuthController],
    providers: [HttpAtStrategy, HttpRtStrategy],
})
export class AuthModule {}
