import { HttpStatus, Injectable } from '@nestjs/common';
import { IoDtos } from '../dto/core';
import { RequestService } from './request.service';
import ErrorDto = IoDtos.ErrorDto;
import PayloadDto = IoDtos.PayloadDto;
import ResponseDto = IoDtos.ResponseDto;
import FieldErrorDto = IoDtos.FieldErrorDto;
import SystemErrorDto = IoDtos.SystemErrorDto;
import PageResponseDto = IoDtos.PageResponseDto;

@Injectable()
export class ResponseService {
    constructor(private readonly requestService: RequestService) {}

    async toResponse<T>(status: HttpStatus, message: string, data: Promise<T>): Promise<ResponseDto> {
        const apiData = await data;
        const available = apiData instanceof Array ? apiData.length : apiData instanceof Object ? 1 : 0;
        const payload = new PayloadDto(available, apiData);
        return new ResponseDto(Date.now() - this.requestService.httpStartTime, status, message, null, payload);
    }

    async toDtoResponse<T>(status: HttpStatus, message: string, data: Promise<T>): Promise<ResponseDto> {
        const apiData = await data;
        const available = apiData ? 1 : 0;
        const payload = new PayloadDto(available, apiData);
        return new ResponseDto(Date.now() - this.requestService.httpStartTime, status, message, null, payload);
    }

    async toDtosResponse<T>(status: HttpStatus, message: string, data: Promise<T[]>): Promise<ResponseDto> {
        const apiData = await data;
        const count = apiData instanceof Array ? apiData.length : 0;
        const payload = new PayloadDto(count, apiData);
        return new ResponseDto(Date.now() - this.requestService.httpStartTime, status, message, null, payload);
    }

    async toPosfResponse<T>(
        status: HttpStatus,
        message: string,
        page: number,
        limit: number,
        data: Promise<[T[], number]>,
    ): Promise<ResponseDto> {
        const [apiData, total] = await data;
        const pageCount = Math.ceil(total / limit);
        const pageResponseDto = new PageResponseDto(page, limit, total, pageCount, apiData);
        return new ResponseDto(Date.now() - this.requestService.httpStartTime, status, message, null, null, pageResponseDto);
    }

    async toErrorResponse(status: HttpStatus, message: string, error: any): Promise<ResponseDto> {
        const fieldErrors = [];
        if (error.errors) {
            Object.keys(error.errors).forEach((key) => {
                fieldErrors.push(new FieldErrorDto(`${key}`, error.errors[key].value, error.errors[key].message));
            });
        }
        message = error.message ? error.message : message;
        let errorDto;
        if (fieldErrors.length > 0) {
            errorDto = new ErrorDto(fieldErrors, null);
        } else {
            const systemErrorDto = new SystemErrorDto('System', 'Error', message);
            errorDto = new ErrorDto(null, systemErrorDto);
        }
        return new ResponseDto(Date.now() - this.requestService.httpStartTime, status, message, errorDto, null);
    }
}
