import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Transform } from 'class-transformer';
import { en_US_Collation } from '@packages/mongo';
import { ENUMS } from '@packages/enums';
import CollectionEnum = ENUMS.PROJECT.CollectionEnum;

@Schema({
    timestamps: true,
    versionKey: false,
    ...en_US_Collation,
})
export class UserEntity {
    @Transform(({ value }) => value.toString())
    _id: Types.ObjectId;

    @Prop({ type: SchemaTypes.Date, default: null })
    deletedAt: Date | null;

    @Prop({ type: SchemaTypes.ObjectId, ref: UserEntity.name })
    createdBy: Types.ObjectId | null;

    @Prop({ type: SchemaTypes.ObjectId, ref: UserEntity.name })
    updatedBy: Types.ObjectId | null;

    @Prop({ type: SchemaTypes.String, required: true })
    username: string;

    @Prop({
        type: SchemaTypes.String,
        lowercase: true,
        minLength: 4,
        maxlength: 50,
        default: null,
    })
    email: string;

    @Prop({ type: SchemaTypes.String, required: true, minLength: 4 })
    password: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: CollectionEnum.PROFILES, required: false, default: null })
    profile: Types.ObjectId | null;

    @Prop({ type: SchemaTypes.String, required: false })
    hashedRt: string;
}

const UserSchemaBuild = SchemaFactory.createForClass(UserEntity);
UserSchemaBuild.index({ createdAt: 1 });
UserSchemaBuild.index({ updatedAt: 1 });
UserSchemaBuild.index({ email: 1 });
export const UserSchema = UserSchemaBuild;
export type UserDocument = UserEntity & Document;
