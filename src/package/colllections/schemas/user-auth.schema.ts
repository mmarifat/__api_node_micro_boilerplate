import { Document, SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';

@Schema({
    timestamps: true,
})
export class UserAuthEntity {
    @Transform(({ value }) => value.toString())
    _id: string;

    @Prop({
        type: SchemaTypes.String,
        lowercase: true,
        minLength: 4,
        maxlength: 50,
        default: null,
    })
    email: string;

    @Prop({ type: SchemaTypes.String, minLength: 5, maxlength: 15, default: null })
    phone: string;

    @Prop({ type: SchemaTypes.String, required: true })
    password: string;

    @Prop({ type: SchemaTypes.Number, required: true, default: 1 })
    isActive: number;

    @Prop({ type: SchemaTypes.ObjectId, ref: UserAuthEntity.name })
    createdBy: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, ref: UserAuthEntity.name })
    updatedBy: Types.ObjectId;
}

const UserAuthSchema = SchemaFactory.createForClass(UserAuthEntity);

UserAuthSchema.index({ email: 1, phone: 1 }, { unique: true });

export type UserAuthDocument = UserAuthEntity & Document;

export default UserAuthSchema;
