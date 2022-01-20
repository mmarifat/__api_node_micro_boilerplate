import { HttpStatus } from '@nestjs/common';
import { PageResponseDto } from './page-response.dto';
import { ErrorDto } from './error.dto';
import { PayloadDto } from './payload.dto';

export class ResponseDto {
    constructor(
        public nonce: number,
        public status: HttpStatus,
        public message: string,
        public error?: ErrorDto,
        public payload?: PayloadDto,
        public page?: PageResponseDto,
    ) {}
}
