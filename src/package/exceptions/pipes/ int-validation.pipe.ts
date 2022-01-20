import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { IntValidationException } from '../validations/int-validation.exception';

@Injectable()
export class IntValidationPipe implements PipeTransform<string> {
    async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
        const isNumeric = ['string', 'number'].includes(typeof value) && !isNaN(parseFloat(value)) && isFinite(value as any);
        if (!isNumeric) {
            throw new IntValidationException(metadata.data, value, 'Int Validation Error');
        }
        return parseInt(value, 10);
    }
}
