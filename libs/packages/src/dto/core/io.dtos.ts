import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { HttpStatus } from '@nestjs/common';

export namespace IoDtos {
    export class PageDto {
        constructor(public pageNo: number = 0, public limit: number = 10) {}
    }

    export class PaginationDto {
        @IsOptional()
        @Type(() => Number)
        @IsNumber()
        @Min(0)
        pageNo?: number;

        @IsOptional()
        @Type(() => Number)
        @IsNumber()
        @Min(1)
        limit?: number;
    }

    export class DeleteDto {
        constructor(public isDeleted: boolean) {}
    }

    export class ErrorDto {
        constructor(public fields?: FieldErrorDto[], public system?: SystemErrorDto) {}
    }

    export class FieldErrorDto {
        constructor(public field: string, public value: string, public message: string | string[], public children?: FieldErrorDto[]) {}
    }

    export class PageResponseDto extends PageDto {
        constructor(public pageNo: number = 0, public limit: number = 10, public count: number = 0, public data: any[] | any = []) {
            super(pageNo, limit);
        }
    }

    export class PayloadDto {
        constructor(public count: number = 0, public data: any | any[] = []) {}
    }

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

    export class SystemErrorDto {
        constructor(public domain: string, public value: string, public message: string) {}
    }
}
