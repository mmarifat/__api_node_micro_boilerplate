import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TapMiddleware implements NestMiddleware {
    use(request: Request, response: Response, next: NextFunction): void {
        request['__startTime'] = Date.now();
        next();
    }
}
