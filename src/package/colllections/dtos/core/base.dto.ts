import { Allow } from 'class-validator';
import { ActiveStatus } from '../../../enums/active.enum';
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
    isActive: ActiveStatus;

    @Allow()
    createdBy: Types.ObjectId | null;

    @Allow()
    updatedBy: Types.ObjectId | null;
}
