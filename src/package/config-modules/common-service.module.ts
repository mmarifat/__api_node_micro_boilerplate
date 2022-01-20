import { Global, Module } from '@nestjs/common';
import { BcryptService } from '../services/bcrypt-js.service';
import { JwtRequestService } from '../services/jwt-request.service';
import { ExceptionService } from '../services/exception.service';
import { ResponseService } from '../services/response.service';

const commonServices = [BcryptService, JwtRequestService, ExceptionService, ResponseService];

@Global()
@Module({
    providers: [...commonServices],
    exports: [...commonServices],
})
export class CommonServiceModule {}
