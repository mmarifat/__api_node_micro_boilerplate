import { HttpStatus } from '@nestjs/common';
import { IoDtos } from '@packages/dto/core';
import FieldErrorDto = IoDtos.FieldErrorDto;
import ErrorDto = IoDtos.ErrorDto;
import SystemErrorDto = IoDtos.SystemErrorDto;
import ResponseDto = IoDtos.ResponseDto;

export function BaseSystemExceptionBuilder(error: any) {
    let status = error.status || error.statusCode || error.httpCode || error.code || HttpStatus.INTERNAL_SERVER_ERROR;
    let message =
        error.message ||
        error.errorMessage ||
        error.errorDescription ||
        error.error_message ||
        error.error_description ||
        'Internal Server Error';

    if (error.isGuard) {
        status = HttpStatus.FORBIDDEN;
        message = error?.guardMessage || 'You are not authorized to access!';
    }

    const fieldErrors = [];
    if (error.errors) {
        Object.keys(error.errors).forEach((key) => {
            fieldErrors.push(new FieldErrorDto(`${key}`, error.errors[key].value, error.errors[key].message));
        });
    }
    let errorDto: ErrorDto;
    if (fieldErrors.length > 0) {
        status = HttpStatus.BAD_REQUEST;
        errorDto = new ErrorDto(fieldErrors, null);
    } else {
        const systemErrorDto = new SystemErrorDto('System', error.systemError, message);
        errorDto = new ErrorDto(null, systemErrorDto);
    }
    return new ResponseDto(Date.now(), status, message, errorDto, null);
}
