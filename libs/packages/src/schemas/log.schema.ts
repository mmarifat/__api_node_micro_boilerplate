import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Transform } from 'class-transformer';
import { en_US_Collation } from '@packages/mongo';
import { LogRequestResponseDto } from '@packages/dto/core';
import { ENUMS } from '@packages/enums';
import CollectionEnum = ENUMS.PROJECT.CollectionEnum;

@Schema({
    _id: false,
    versionKey: false,
    ...en_US_Collation,
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
    ...en_US_Collation,
})
export class LogEntity {
    @Transform(({ value }) => value.toString())
    _id: Types.ObjectId;

    @Prop({ type: SchemaTypes.Date, default: null })
    deletedAt: Date | null;

    @Prop({ type: SchemaTypes.ObjectId, ref: CollectionEnum.USERS })
    createdBy: Types.ObjectId | null;

    @Prop({ type: SchemaTypes.ObjectId, ref: CollectionEnum.USERS })
    updatedBy: Types.ObjectId | null;

    @Prop({ type: SchemaTypes.String })
    type: string;

    @Prop({ type: SchemaTypes.String })
    url: string;

    @Prop({ type: SchemaTypes.Mixed })
    remoteAddress: any;

    @Prop({ type: LogRequestResponseSchema })
    context: LogRequestResponseDto;
}

const LogSchemaBuild = SchemaFactory.createForClass(LogEntity);
LogSchemaBuild.index({ createdAt: 1 });
LogSchemaBuild.index({ updatedAt: 1 });
export const LogSchema = LogSchemaBuild;
export type LogDocument = LogEntity & Document;
