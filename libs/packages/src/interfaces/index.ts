import { UserDto } from '@packages/dto/auth';

export type JwtHttpRequest = UserDto & { __refreshToken?: string; __accessToken?: string };

export type JwtRpcRequest = {
    __jwtUser: JwtHttpRequest;
    [x: string]: any;
};

export type JwtRpcPayload = { __refreshToken?: string; __accessToken?: string; [x: string]: any };
