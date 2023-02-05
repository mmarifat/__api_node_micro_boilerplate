import { Allow } from 'class-validator';
import { Types } from 'mongoose';

export class BaseDto {
    @Allow()
    _id: Types.ObjectId;

    @Allow()
    __v: number;

    @Allow()
    createdAt: Date;

    @Allow()
    updatedAt: Date;

    @Allow()
    deletedAt: Date | null;

    @Allow()
    createdBy: Types.ObjectId | null;

    @Allow()
    updatedBy: Types.ObjectId | null;
}
