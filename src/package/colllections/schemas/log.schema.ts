import { Document, SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { UserAuthEntity } from './user-auth.schema';
import { LogRequestResponseDto } from '../dtos/log.dto';

@Schema({
    _id: false,
})
export class LogRequestResponseEntity {
    @Prop({ type: SchemaTypes.Mixed, default: null })
    body: any;

    @Prop({ type: SchemaTypes.Mixed, default: null })
    response: any;
}

const LogRequestResponseSchema = SchemaFactory.createForClass(LogRequestResponseEntity);

@Schema({
    timestamps: true,
})
export class LogEntity {
    @Transform(({ value }) => value.toString())
    _id: string;

    @Prop({ type: SchemaTypes.String })
    type: string;

    @Prop({ type: SchemaTypes.String })
    url: string;

    @Prop({ type: SchemaTypes.Mixed })
    remoteAddress: any;

    @Prop({ type: LogRequestResponseSchema })
    context: LogRequestResponseDto;

    @Prop({ type: SchemaTypes.ObjectId, ref: UserAuthEntity.name })
    createdBy: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, ref: UserAuthEntity.name })
    updatedBy: Types.ObjectId;
}

const LogSchema = SchemaFactory.createForClass(LogEntity);

export type LogDocument = LogEntity & Document;

export default LogSchema;
