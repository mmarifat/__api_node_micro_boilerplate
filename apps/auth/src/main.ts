import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroAuthModule } from '@auth/src/micro.auth.module';
import { RmqService } from '@packages/services';
import { ENUMS } from '@packages/enums';
import MicroserviceEnum = ENUMS.MICROSERVICE.MicroserviceEnum;

async function bootstrap() {
    const app = await NestFactory.create(MicroAuthModule);
    const rmqService = app.get<RmqService>(RmqService);
    app.connectMicroservice(rmqService.getOptions(MicroserviceEnum.AUTH));
    await app.startAllMicroservices();
    new Logger('api-mongo-micro-auth').verbose(`${MicroserviceEnum.AUTH} microservice started`);
}
bootstrap();
