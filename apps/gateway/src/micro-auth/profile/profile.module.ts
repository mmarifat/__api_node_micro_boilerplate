import { Global, Module } from '@nestjs/common';
import { ProfileController } from '@gateway/src/micro-auth/profile/profile.controller';
import { RmqConfigModule } from '@packages/modules';
import { ENUMS } from '@packages/enums';
import MicroserviceEnum = ENUMS.MICROSERVICE.MicroserviceEnum;

@Global()
@Module({
    imports: [
        RmqConfigModule.register({
            name: MicroserviceEnum.AUTH,
        }),
    ],
    controllers: [ProfileController],
})
export class ProfileModule {}
