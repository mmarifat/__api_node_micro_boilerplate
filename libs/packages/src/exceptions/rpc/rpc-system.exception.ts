import { RpcException } from '@nestjs/microservices';
import { BaseSystemExceptionBuilder } from '@packages/exceptions/base-system.exception-builder';

export class RpcSystemException extends RpcException {
    constructor(error: any) {
        super(BaseSystemExceptionBuilder(error));
    }
}
