import { BaseDto } from '@packages/dto/core/index';
export class LogRequestResponseDto {
    body: any;
    response: any;
}

export class LogDto extends BaseDto {
    type: 'success' | 'error';
    method: string;
    url: string;
    remoteAddress: string | number;
    context: LogRequestResponseDto;
}
