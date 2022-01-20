import { BaseDto } from './core/base.dto';
import { Types } from 'mongoose';

export class LoginHistoryArrayDto {
    remoteAddress: any;
    date: Date;
}

export class LoginHistoryDto extends BaseDto {
    userId: Types.ObjectId;
    history: LoginHistoryArrayDto[];
}
