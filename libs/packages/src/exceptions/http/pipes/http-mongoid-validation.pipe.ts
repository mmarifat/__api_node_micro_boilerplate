import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { stringToMongoId } from '@packages/mongo';
import { ENUMS } from '@packages/enums';
import ValidationTypeEnum = ENUMS.ValidationTypeEnum;
import { HttpMongoidValidationException } from '@packages/exceptions/http/validations';

@Injectable()
export class HttpMongoidValidationPipe implements PipeTransform<any, Types.ObjectId> {
    transform(value: any, metadata: ArgumentMetadata): Types.ObjectId {
        try {
            const validObjectId = Types.ObjectId.isValid(value) && stringToMongoId(value).toString() === value;
            if (!validObjectId)
                throw new HttpMongoidValidationException(
                    metadata.data,
                    value,
                    'Mongo ObjectID Validation Error',
                    ValidationTypeEnum.MONGOID,
                );
            return stringToMongoId(value);
        } catch (e) {
            throw new HttpMongoidValidationException(metadata.data, value, 'Mongo ObjectID Validation Error', ValidationTypeEnum.MONGOID);
        }
    }
}
