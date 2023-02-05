import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { IoDtos } from '@packages/dto/core';
import ResponseDto = IoDtos.ResponseDto;
import SystemErrorDto = IoDtos.SystemErrorDto;
import ErrorDto = IoDtos.ErrorDto;

@Catch(HttpException)
export class HttpSystemExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpSystemExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const {
            method,
            socket: { remoteAddress },
            url,
        } = request;
        const context = exception['context'] || '-/-';

        const statusCode = exception ? exception.getStatus() : <number>HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception.message || 'Internal error';
        let responseDto = exception.getResponse() as ResponseDto;

        const processTime = Date.now() - request['__startTime'];
        if (!responseDto) {
            const systemErrorDto = new SystemErrorDto('url', `${url}`, `${message}`);
            const errorDto = new ErrorDto(null, systemErrorDto);
            responseDto = new ResponseDto(processTime, statusCode, 'Error', errorDto);
        } else if (responseDto && responseDto.nonce) {
            responseDto.nonce = processTime;
        }

        this.logger.error({
            url,
            method,
            statusCode,
            processTime,
            remoteAddress,
            context,
            message: JSON.stringify(responseDto),
        });
        response.status(statusCode).json(responseDto);
    }
}
