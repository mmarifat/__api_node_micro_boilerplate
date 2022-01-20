import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BcryptService {
    private readonly saltRounds = 12;

    async hashPassword(password: string): Promise<string> {
        const hashPassword = await bcrypt.hash(password, this.saltRounds);
        return Promise.resolve(hashPassword);
    }

    async comparePassword(password: string, hashPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashPassword);
    }
}
