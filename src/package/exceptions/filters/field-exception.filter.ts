import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { DtoValidationException } from '../validations/dto-validation.exception';
import { ValidationType } from '../validations/validation-type.enum';
import { BooleanValidationException } from '../validations/boolean-validation.exception';
import { MongoidValidationException } from '../validations/mongoid-validation.exception';
import { IntValidationException } from '../validations/int-validation.exception';
import { ResponseDto } from '../../dtos/response/response.dto';
import { ErrorDto } from '../../dtos/response/error.dto';
import { FieldErrorDto } from '../../dtos/response/field-error.dto';

@Catch(DtoValidationException, BooleanValidationException, MongoidValidationException, IntValidationException)
export class FieldExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(FieldExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost): any {
        const now = Date.now();
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const processTime = exception['processTime'] || '0';
        const context = exception['context'] || '-/-';
        const { method, socket, url } = request;
        const { remoteAddress } = socket;

        let error = null;

        switch (exception.validationType) {
            case ValidationType.DTO:
                error = this.dtoValidationError(exception);
                break;
            case ValidationType.MONGOID:
                error = this.mongoIdValidationError(exception);
                break;
            case ValidationType.BOOLEAN:
                error = this.booleanValidationError(exception);
                break;
            case ValidationType.INT:
                error = this.intValidationError(exception);
                break;
        }

        const status = <number>HttpStatus.BAD_REQUEST;
        const responseDto = new ResponseDto(now, status, <string>exception.message, new ErrorDto(error, null));

        this.logger.error({
            remoteIP: `${remoteAddress}`,
            method: `${method}`,
            processTime: `${processTime}`,
            statusCode: status,
            url: `${url}`,
            context: `${context}`,
            message: `${JSON.stringify(responseDto)}`,
        });

        return response.json(responseDto);
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
