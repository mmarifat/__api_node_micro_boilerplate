import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { en_US_Collation } from '@packages/mongo';
import { LoginHistoryArrayDto } from '@packages/dto/auth';
import { ENUMS } from '@packages/enums';
import CollectionEnum = ENUMS.PROJECT.CollectionEnum;

@Schema({
    _id: false,
    versionKey: false,
    ...en_US_Collation,
})
export class LoginHistoryArrayEntity {
    @Prop({ type: SchemaTypes.Mixed, required: true })
    remoteAddress: any;

    @Prop({ type: SchemaTypes.Date, required: true })
    date: any;
}

const LoginHistoryArraySchema = SchemaFactory.createForClass(LoginHistoryArrayEntity);

@Schema({
    timestamps: true,
    versionKey: false,
    ...en_US_Collation,
})
export class LoginHistoryEntity {
    @Prop({ type: SchemaTypes.ObjectId, ref: CollectionEnum.USERS })
    userId: Types.ObjectId;

    @Prop({ type: [LoginHistoryArraySchema] })
    history: LoginHistoryArrayDto[];
}

const LoginHistorySchemaBuild = SchemaFactory.createForClass(LoginHistoryEntity);
LoginHistorySchemaBuild.index({ createdAt: 1 });
LoginHistorySchemaBuild.index({ updatedAt: 1 });
export const LoginHistorySchema = LoginHistorySchemaBuild;
export type LoginHistoryDocument = LoginHistoryEntity & Document;
