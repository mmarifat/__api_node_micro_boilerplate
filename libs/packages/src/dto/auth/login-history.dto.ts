import { Types } from 'mongoose';
import { BaseDto } from '@packages/dto/core/base.dto';

export class LoginHistoryArrayDto {
    remoteAddress: any;
    date: Date;
}

export class LoginHistoryDto extends BaseDto {
    userId: Types.ObjectId;
    history: LoginHistoryArrayDto[];
}
