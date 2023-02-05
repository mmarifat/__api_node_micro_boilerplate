import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, models, Schema } from 'mongoose';
import { ENUMS } from '@packages/enums';
import CollectionEnum = ENUMS.PROJECT.CollectionEnum;
import { ExceptionService } from '@packages/services/exception.service';

@Injectable()
export class MongoService {
    constructor(@InjectConnection() private connection: Connection, private readonly exceptionService: ExceptionService) {}

    con() {
        return this.connection;
    }

    private modelBuilder<T>({ schema, collection }: { schema: Schema; collection: CollectionEnum | string }) {
        if (models[collection]) delete models[collection];
        this.connection.model(collection, schema);
        return this.connection.model<T>(collection, schema);
    }

    httpGetModel<T>({ schema, collection }: { schema: Schema; collection: CollectionEnum | string }) {
        if (!schema || !(schema instanceof Schema)) {
            this.exceptionService.httpException(HttpStatus.PRECONDITION_FAILED, 'Invalid Schema');
        }
        return this.modelBuilder<T>({ schema, collection });
    }

    rpcGetModel<T>({ schema, collection }: { schema: Schema; collection: CollectionEnum | string }) {
        if (!schema || !(schema instanceof Schema)) {
            this.exceptionService.rpcException(HttpStatus.PRECONDITION_FAILED, 'Invalid Schema');
        }
        return this.modelBuilder<T>({ schema, collection });
    }
}
