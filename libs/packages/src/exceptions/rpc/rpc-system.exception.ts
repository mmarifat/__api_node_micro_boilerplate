import { RpcException } from '@nestjs/microservices';
import { BaseSystemExceptionBuilder } from '@packages/exceptions/base-system.exception-builder';

export class RpcSystemException extends RpcException {
    constructor(error: any) {
        if (error instanceof RpcSystemException) {
            throw error;
        }
        super(BaseSystemExceptionBuilder(error));
    }
}
