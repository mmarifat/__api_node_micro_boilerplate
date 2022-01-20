import { ArgumentMetadata, Injectable, Optional, PipeTransform, ValidationPipeOptions } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DtoValidationException } from '../validations/dto-validation.exception';

@Injectable()
export class DtoValidationPipe implements PipeTransform<any> {
    options: ValidationPipeOptions;

    constructor(@Optional() options?: ValidationPipeOptions) {
        this.options = options || {};
    }

    private static toValidate(metatype: any): boolean {
        const types: any[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }

    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (!metatype || !DtoValidationPipe.toValidate(metatype)) {
            return value;
        }
        const object = plainToInstance(metatype, value);
        const errors = await validate(object, this.options);
        if (errors.length > 0) {
            throw new DtoValidationException(errors, 'DTO Validation Error');
        }
        return value;
    }
}
