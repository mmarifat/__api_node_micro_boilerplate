import { Document, SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserAuthEntity } from './user-auth.schema';
import { LoginHistoryArrayDto } from '../dtos/login-history.dto';

@Schema({
    _id: false,
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
})
export class LoginHistoryEntity {
    @Prop({ type: SchemaTypes.ObjectId, ref: UserAuthEntity.name })
    userId: Types.ObjectId;

    @Prop({ type: [LoginHistoryArraySchema] })
    history: LoginHistoryArrayDto[];
}

const LoginHistorySchema = SchemaFactory.createForClass(LoginHistoryEntity);

export type LoginHistoryDocument = LoginHistoryEntity & Document;

export default LoginHistorySchema;
