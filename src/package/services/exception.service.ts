import { HttpStatus, Injectable } from '@nestjs/common';
import { SystemException } from '../exceptions/system.exception';

@Injectable()
export class ExceptionService {
    exception(status: HttpStatus = HttpStatus.BAD_REQUEST, message = 'Exception occured') {
        throw new SystemException({
            status,
            message,
        });
    }

    notFound<T>(dto: T | T[], message: string) {
        if (dto instanceof Array) {
            if (dto.length < 1) {
                throw new SystemException({
                    status: HttpStatus.NOT_FOUND,
                    message,
                });
            }
        } else {
            if (!dto) {
                throw new SystemException({
                    status: HttpStatus.NOT_FOUND,
                    message,
                });
            }
        }
    }
}
