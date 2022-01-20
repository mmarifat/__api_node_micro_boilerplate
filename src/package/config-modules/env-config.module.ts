import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// ENV getter from script prepends
const ENV = process.env['NODE' + '_ENV'];
const envFilePath = [`env/${!ENV ? `.env.production` : `.env.${ENV}`}`];

// setting global env module
@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath,
        }),
    ],
})
export class EnvConfigModule {}
