import { ArgumentMetadata, BadRequestException, Injectable, ParseArrayPipe } from '@nestjs/common';
import { ENUMS } from '@packages/enums';
import ValidationType = ENUMS.ValidationTypeEnum;
import { HttpArrayValidationException } from '@packages/exceptions/http/validations';

@Injectable()
export class HttpArrayValidationPipe extends ParseArrayPipe {
    public async transform(value, metadata: ArgumentMetadata) {
        try {
            return await super.transform(value, metadata);
        } catch (e) {
            if (e instanceof BadRequestException) {
                throw new HttpArrayValidationException(metadata.data, value, 'Array Validation Error', ValidationType.ARRAY);
            }
        }
    }
}
