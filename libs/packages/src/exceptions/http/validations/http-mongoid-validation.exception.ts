import { BadRequestException } from '@nestjs/common';
import { ENUMS } from '@packages/enums';

export class HttpMongoidValidationException extends BadRequestException {
    constructor(
        public field: string,
        public value: string,
        public message: string,
        public validationType = ENUMS.ValidationTypeEnum.MONGOID,
    ) {
        super();
    }
}
