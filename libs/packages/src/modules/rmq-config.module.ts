import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from '@packages/services/rmq.service';

interface RmqModuleOptions {
    name: string;
}

@Module({
    providers: [RmqService],
    exports: [RmqService],
})
export class RmqConfigModule {
    static register({ name }: RmqModuleOptions): DynamicModule {
        return {
            module: RmqConfigModule,
            imports: [
                ClientsModule.registerAsync([
                    {
                        name,
                        useFactory: (configService: ConfigService) => ({
                            transport: Transport.RMQ,
                            options: {
                                urls: [configService.get<string>('RABBIT_MQ_URI')],
                                queue: configService.get<string>(`RABBIT_MQ_${name}_QUEUE`),
                            },
                        }),
                        inject: [ConfigService],
                    },
                ]),
            ],
            exports: [ClientsModule],
        };
    }
}
