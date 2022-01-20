import { HttpException, HttpStatus } from '@nestjs/common';
import { FieldErrorDto } from '../dtos/response/field-error.dto';
import { ErrorDto } from '../dtos/response/error.dto';
import { SystemErrorDto } from '../dtos/response/system-error.dto';
import { ResponseDto } from '../dtos/response/response.dto';

export class SystemException extends HttpException {
    constructor(error: any) {
        const fieldErrors = [];

        if (error.errors) {
            Object.keys(error.errors).forEach((key) => {
                fieldErrors.push(new FieldErrorDto(`${key}`, error.errors[key].value, error.errors[key].message));
            });
        }
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (error.status) {
            status = error.status;
        }
        let message = error.message ? error.message : 'Error';
        if (error.isGuard) {
            status = HttpStatus.UNAUTHORIZED;
            message = 'You are not authorized to access!';
        }

        let errorDto: ErrorDto;
        if (fieldErrors.length > 0) {
            status = HttpStatus.BAD_REQUEST;
            errorDto = new ErrorDto(fieldErrors, null);
        } else {
            const systemErrorDto = new SystemErrorDto('System', error.systemError, message);
            errorDto = new ErrorDto(null, systemErrorDto);
        }

        const now = new Date().getTime();

        const responseDto = new ResponseDto(now, status, message, errorDto, null);

        super(responseDto, status);
    }
}
