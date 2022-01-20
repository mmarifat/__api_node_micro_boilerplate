import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ValidationType } from './validation-type.enum';

export class DtoValidationException extends BadRequestException {
    constructor(public errors: ValidationError[], public message: string, public validationType: ValidationType = ValidationType.DTO) {
        super();
    }
}
