import { HttpStatus, Injectable } from '@nestjs/common';
import { PayloadDto } from '../dtos/response/payload.dto';
import { PageResponseDto } from '../dtos/response/page-response.dto';
import { ResponseDto } from '../dtos/response/response.dto';
import { BaseDto } from '../colllections/dtos/core/base.dto';
import { FieldErrorDto } from '../dtos/response/field-error.dto';
import { ErrorDto } from '../dtos/response/error.dto';
import { SystemErrorDto } from '../dtos/response/system-error.dto';

@Injectable()
export class ResponseService {
    async toResponse<T>(status: HttpStatus, message: string, data: Promise<T | T[]>): Promise<ResponseDto> {
        const apiData = await data;
        const count = apiData instanceof Array ? apiData.length : apiData instanceof Object ? 1 : 0;
        const payload = new PayloadDto(count, apiData);
        return new ResponseDto(new Date().getTime(), status, message, null, payload);
    }

    async toPaginationResponse<T extends BaseDto>(
        status: HttpStatus,
        message: string,
        page: number,
        limit: number,
        totalCount: number,
        data: Promise<[T[], number]>,
    ): Promise<ResponseDto> {
        const [apiData, total] = await data;
        const pageResponseDto = new PageResponseDto(page, limit, total, apiData);
        return new ResponseDto(new Date().getTime(), status, message, null, null, pageResponseDto);
    }

    async toErrorResponse(status: HttpStatus, message: string, error: any): Promise<ResponseDto> {
        const fieldErrors = [];

        if (error.errors) {
            Object.keys(error.errors).forEach((key) => {
                fieldErrors.push(new FieldErrorDto(`${key}`, error.errors[key].value, error.errors[key].message));
            });
        }

        message = error.message ? error.message : message;

        let errorDto = null;
        if (fieldErrors.length > 0) {
            errorDto = new ErrorDto(fieldErrors, null);
        } else {
            const systemErrorDto = new SystemErrorDto('System', 'Error', message);
            errorDto = new ErrorDto(null, systemErrorDto);
        }

        const now = new Date().getTime();

        return new ResponseDto(now, status, message, errorDto, null);
    }
}
