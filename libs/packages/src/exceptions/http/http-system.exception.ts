import { HttpException } from '@nestjs/common';
import { BaseSystemExceptionBuilder } from '@packages/exceptions/base-system.exception-builder';

export class HttpSystemException extends HttpException {
    constructor(error: any) {
        if (error instanceof HttpSystemException) {
            throw error;
        }
        const response = BaseSystemExceptionBuilder(error);
        super(response, response.status);
    }
}
