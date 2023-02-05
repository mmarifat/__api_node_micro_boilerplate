import { HttpException } from '@nestjs/common';
import { BaseSystemExceptionBuilder } from '@packages/exceptions/base-system.exception-builder';

export class HttpSystemException extends HttpException {
    constructor(error: any) {
        const response = BaseSystemExceptionBuilder(error);
        super(response, response.status);
    }
}
