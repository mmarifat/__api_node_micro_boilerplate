import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { HttpIntValidationException } from '@packages/exceptions/http/validations';

@Injectable()
export class HttpIntValidationPipe implements PipeTransform<string> {
    async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
        const isNumeric = ['string', 'number'].includes(typeof value) && !isNaN(parseFloat(value)) && isFinite(value as any);
        if (!isNumeric) {
            throw new HttpIntValidationException(metadata.data, value, 'Int Validation Error');
        }
        return parseInt(value, 10);
    }
}
