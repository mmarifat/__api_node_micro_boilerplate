import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroAuthModule } from '@auth/src/micro.auth.module';
import { RmqService } from '@packages/services';
import { ENUMS } from '@packages/enums';
import MicroserviceEnum = ENUMS.MICROSERVICE.MicroserviceEnum;

declare const module: any;

async function bootstrap() {
    const app = await NestFactory.create(MicroAuthModule);
    const rmqService = app.get<RmqService>(RmqService);
    app.connectMicroservice(rmqService.getOptions(MicroserviceEnum.AUTH));
    await app.startAllMicroservices();

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }

    new Logger(`api-mongo-micro-${MicroserviceEnum.AUTH}`).verbose(`✩✩✩ ${MicroserviceEnum.AUTH} microservice started`);
}
bootstrap();
