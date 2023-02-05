import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, SchemaTypes, Types } from 'mongoose';
import { en_US_Collation } from '@packages/mongo';

@Schema({
    timestamps: false,
    versionKey: false,
    ...en_US_Collation,
})
export class ProfileEntity {
    @Transform(({ value }) => value.toString())
    _id: Types.ObjectId;

    @Prop({ type: SchemaTypes.String, required: false, default: null })
    coverImageUrl: string;

    @Prop({ type: SchemaTypes.String, required: false, default: null })
    profileImageUrl: string;

    @Prop({ type: SchemaTypes.String, required: false, default: null })
    description: string;

    @Prop({ type: SchemaTypes.String, required: false, default: null })
    presentAddress: string;

    @Prop({ type: SchemaTypes.String, required: false, default: null })
    permanentAddress: string;

    @Prop({ type: SchemaTypes.String, required: false, default: null })
    companyAddress: string;
}

const ProfileSchemaBuild = SchemaFactory.createForClass(ProfileEntity);
ProfileSchemaBuild.index({ createdAt: 1 });
ProfileSchemaBuild.index({ updatedAt: 1 });
export const ProfileSchema = ProfileSchemaBuild;
export type ProfileDocument = ProfileEntity & Document;
