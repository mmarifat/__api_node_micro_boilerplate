import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpSystemException, RpcSystemException } from '@packages/exceptions';

@Injectable()
export class ExceptionService {
    httpException(status: HttpStatus = HttpStatus.BAD_REQUEST, message = 'Exception occurred') {
        throw new HttpSystemException({ status, message });
    }
    rpcException(status: HttpStatus = HttpStatus.BAD_REQUEST, message = 'Exception occurred') {
        throw new RpcSystemException({ status, message });
    }
    httpNotFound<T>(dto: T | T[], message: string) {
        const payload = {
            status: HttpStatus.NOT_FOUND,
            message,
        };
        if (dto instanceof Array) {
            if (dto.length < 1) {
                throw new HttpSystemException(payload);
            }
        } else {
            if (!dto) {
                throw new HttpSystemException(payload);
            }
        }
    }
    rpcNotFound<T>(dto: T | T[], message: string) {
        const payload = {
            status: HttpStatus.NOT_FOUND,
            message,
        };
        if (dto instanceof Array) {
            if (dto.length < 1) {
                throw new RpcSystemException(payload);
            }
        } else {
            if (!dto) {
                throw new RpcSystemException(payload);
            }
        }
    }
}
