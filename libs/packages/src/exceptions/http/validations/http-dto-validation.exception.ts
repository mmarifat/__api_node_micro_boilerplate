import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ENUMS } from '@packages/enums';

export class HttpDtoValidationException extends BadRequestException {
    constructor(public errors: ValidationError[], public message: string, public validationType = ENUMS.ValidationTypeEnum.DTO) {
        super();
    }
}
