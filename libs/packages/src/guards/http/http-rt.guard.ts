import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { HttpSystemException } from '@packages/exceptions/http';

@Injectable()
export class HttpRtGuard extends AuthGuard('jwt-refresh') {
    constructor() {
        super();
    }

    handleRequest(err: any, user: any) {
        if (err || !user) {
            throw new HttpSystemException({ isGuard: true, guardMessage: 'INVALID_REFRESH_TOKEN' });
        }
        return user;
    }
}
