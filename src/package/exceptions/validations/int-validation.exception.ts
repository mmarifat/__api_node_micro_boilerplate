import { BadRequestException } from '@nestjs/common';
import { ValidationType } from './validation-type.enum';

export class IntValidationException extends BadRequestException {
    constructor(
        public field: string,
        public value: string,
        public message: string,
        public validationType: ValidationType = ValidationType.INT,
    ) {
        super();
    }
}
