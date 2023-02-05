import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import {
    HttpArrayValidationException,
    HttpBooleanValidationException,
    HttpDtoValidationException,
    HttpIntValidationException,
    HttpMongoidValidationException,
} from '@packages/exceptions/http/validations';
import { ENUMS } from '@packages/enums';
import { IoDtos } from '@packages/dto/core';
import ErrorDto = IoDtos.ErrorDto;
import ResponseDto = IoDtos.ResponseDto;
import FieldErrorDto = IoDtos.FieldErrorDto;
import ValidationTypeEnum = ENUMS.ValidationTypeEnum;

@Catch(
    HttpDtoValidationException,
    HttpBooleanValidationException,
    HttpMongoidValidationException,
    HttpIntValidationException,
    HttpArrayValidationException,
)
export class HttpFieldExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpFieldExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost): any {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const {
            method,
            socket: { remoteAddress },
            url,
        } = request;
        const context = exception['context'] || '-/-';

        let error = null;

        switch (exception.validationType) {
            case ValidationTypeEnum.DTO:
                error = this.dtoValidationError(exception);
                break;
            case ValidationTypeEnum.MONGOID:
                error = this.mongoIdValidationError(exception);
                break;
            case ValidationTypeEnum.BOOLEAN:
                error = this.booleanValidationError(exception);
                break;
            case ValidationTypeEnum.INT:
                error = this.intValidationError(exception);
                break;
            case ValidationTypeEnum.ARRAY:
                error = this.arrayValidationError(exception);
                break;
        }
        const processTime = Date.now() - request['__startTime'];
        const statusCode = <number>HttpStatus.BAD_REQUEST;
        const responseDto = new ResponseDto(processTime, statusCode, <string>exception.message, new ErrorDto(error, null));

        this.logger.error({
            url,
            method,
            statusCode,
            processTime,
            remoteAddress,
            context,
            message: `${JSON.stringify(responseDto)}`,
        });

        return response.status(statusCode).json(responseDto);
    }

    dtoValidationError(exception: any): FieldErrorDto[] {
        const validationErrors: FieldErrorDto[] = [];
        if (exception.errors.length > 0) {
            for (const error of exception.errors) {
                const property = error.property;
                const errorCollection = [];
                if (!error.constraints || Object.keys(error.constraints).length === 0) {
                    this.findChildError(errorCollection, error.children, property);
                } else {
                    errorCollection.push({
                        field: error.property,
                        message: error.constraints[Object.keys(error.constraints)[0]],
                    });
                }
                validationErrors.push(...errorCollection);
            }
            return validationErrors;
        }
    }

    mongoIdValidationError(exception: any): FieldErrorDto[] {
        return [new FieldErrorDto(exception.field, exception.value, `Mongo Object Id is expected`, [])];
    }

    booleanValidationError(exception: any): FieldErrorDto[] {
        return [new FieldErrorDto(exception.field, exception.value, `Boolean string is expected`, [])];
    }

    intValidationError(exception: any): FieldErrorDto[] {
        return [new FieldErrorDto(exception.field, exception.value, `Numeric string is expected`, [])];
    }

    arrayValidationError(exception: any): FieldErrorDto[] {
        return [new FieldErrorDto(exception.field, exception.value, `Array is expected`, [])];
    }

    private findChildError(errorCollection, errors, property) {
        for (const error of errors) {
            if (!error.constraints || Object.keys(error.constraints).length === 0) {
                const nProperty = '.' + error.property;
                const sProperty = '[' + error.property + ']';
                const newProperty = isNaN(error.property) ? nProperty : sProperty;
                this.findChildError(errorCollection, error.children, property + newProperty);
            } else {
                errorCollection.push({
                    field: property + '.' + error.property,
                    message: error.constraints[Object.keys(error.constraints)[0]],
                });
            }
        }
    }
}
