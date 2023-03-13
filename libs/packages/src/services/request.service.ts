import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { Types } from 'mongoose';
import { JwtHttpRequest, JwtRpcPayload } from '@packages/interfaces';

@Injectable()
export class RequestService {
    constructor(@Inject(REQUEST) private readonly __request: Request) {}

    get httpRequest(): Request {
        return this.__request;
    }

    get httpStartTime(): number {
        return this.__request['__startTime'];
    }

    get httpBearerAuth(): string {
        return this.httpRequest.get('authorization').replace('Bearer ', '').trim();
    }

    get httpAuthUser(): JwtHttpRequest {
        return this.httpRequest?.user as JwtHttpRequest;
    }

    get httpAuthUserId(): Types.ObjectId | string {
        return this.httpAuthUser?._id;
    }

    get appendAtToRpc(): JwtRpcPayload {
        return { __accessToken: this.httpBearerAuth, __refreshToken: '' };
    }

    get appendRtToRpc(): JwtRpcPayload {
        return { __refreshToken: this.httpBearerAuth, __accessToken: '' };
    }

    /*
     * Append and returns the original dto with createdBy and updatedBy fields
     */
    createdBy<T>(_id: Types.ObjectId | string | null, dto: T): T {
        dto['createdBy'] = _id || null;
        dto['updatedBy'] = _id || null;
        return dto;
    }

    /*
     * Append and returns the original dto with updatedBy field
     */
    updatedBy<T>(_id: Types.ObjectId | string | null, dto: T): T {
        dto['updatedBy'] = _id || null;
        return dto;
    }
}
