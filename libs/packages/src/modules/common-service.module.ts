import { Global, Module } from '@nestjs/common';
import { BcryptService, CommonService, ExceptionService, MongoService, RequestService, ResponseService } from '@packages/services';

const commonServices = [RequestService, CommonService, MongoService, BcryptService, ExceptionService, ResponseService];

@Global()
@Module({
    providers: [...commonServices],
    exports: [...commonServices],
})
export class CommonServiceModule {}
