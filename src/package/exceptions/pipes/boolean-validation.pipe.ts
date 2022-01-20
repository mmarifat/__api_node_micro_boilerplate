import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { BooleanValidationException } from '../validations/boolean-validation.exception';

@Injectable()
export class BooleanValidationPipe implements PipeTransform<string | boolean, Promise<boolean>> {
    async transform(value: string | boolean, metadata: ArgumentMetadata): Promise<boolean> {
        if (value === true || value === 'true') {
            return true;
        }
        if (value === false || value === 'false') {
            return false;
        }
        throw new BooleanValidationException(metadata.data, value, 'Boolean Validation Error');
    }
}
