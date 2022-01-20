import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { MongoidValidationException } from '../validations/mongoid-validation.exception';
import { ValidationType } from '../validations/validation-type.enum';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
    transform(value: any, metadata: ArgumentMetadata): Types.ObjectId {
        const validObjectId = Types.ObjectId.isValid(value);

        if (!validObjectId) {
            throw new MongoidValidationException(metadata.data, value, 'Mongo ObjectID Validation Error', ValidationType.MONGOID);
        }

        return new Types.ObjectId(value);
    }
}
