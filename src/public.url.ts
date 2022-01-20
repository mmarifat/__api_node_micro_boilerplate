import { RequestMethod } from '@nestjs/common';

export const publicUrls = [
    { path: '/api/v1/user-auth/login', method: RequestMethod.POST },
    { path: '/api/v1/user-auth/register', method: RequestMethod.POST },
];
