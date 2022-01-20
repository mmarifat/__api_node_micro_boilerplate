import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { BaseDto } from '../colllections/dtos/core/base.dto';
import { Types } from 'mongoose';
import { Request } from 'express';

@Injectable()
export class JwtRequestService {
    constructor(@Inject(REQUEST) private readonly request: Request) {}

    /*
     * returns the whole original request object
     */

    req(): Request {
        return this.request;
    }

    /*
     * returns the loggedIn user detail
     */

    jwt(): any {
        return this.request['__auth_user'] || null;
    }

    /*
     * Append and returns the original dto with createdBy and updatedBy fields
     */
    createdBy<T extends BaseDto>(dto: T): T {
        const user = this.jwt();
        if (user) {
            dto.createdBy = new Types.ObjectId(user._id);
            dto.updatedBy = new Types.ObjectId(user._id);
        } else {
            dto.createdBy = null;
            dto.updatedBy = null;
        }
        return dto;
    }

    /*
     * Append and returns the original dto with updatedBy field
     */
    updatedBy<T extends BaseDto>(dto: T): T {
        const user = this.jwt();
        if (user) {
            dto.updatedBy = new Types.ObjectId(user._id);
        } else {
            dto.updatedBy = null;
        }
        return dto;
    }
}
