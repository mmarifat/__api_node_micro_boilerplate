import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { HttpBooleanValidationException } from '@packages/exceptions/http/validations';

@Injectable()
export class HttpBooleanValidationPipe implements PipeTransform<string | boolean, Promise<boolean>> {
    async transform(value: string | boolean, metadata: ArgumentMetadata): Promise<boolean> {
        if (value === true || value === 'true') {
            return true;
        }
        if (value === false || value === 'false') {
            return false;
        }
        throw new HttpBooleanValidationException(metadata.data, value, 'Boolean Validation Error');
    }
}
