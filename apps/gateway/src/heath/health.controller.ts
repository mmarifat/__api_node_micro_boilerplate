import { Controller, Get, HttpException, HttpStatus, Sse } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { interval, mergeMap } from 'rxjs';
import {
    HealthCheck,
    HealthCheckService,
    MemoryHealthIndicator,
    MicroserviceHealthIndicator,
    MongooseHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '@packages/decorators';
import { ENUMS } from '@packages/enums';
import { MaintenanceHealthIndicator } from '@packages/health-indicators';
import RedisClientEnum = ENUMS.RedisClientEnum;

@ApiTags('Heath API')
@Controller('health')
@Public()
export class HealthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly health: HealthCheckService,
        private memoryHealth: MemoryHealthIndicator,
        private readonly mongodbHealth: MongooseHealthIndicator,
        private readonly maintenanceHealth: MaintenanceHealthIndicator,
        private readonly microserviceHealth: MicroserviceHealthIndicator,
    ) {}

    @Get('')
    @HealthCheck()
    async allServiceStats() {
        try {
            return this.heathCheck;
        } catch (e) {
            throw new HttpException(e, HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @Sse('sse')
    @HealthCheck()
    async allServiceStatsSse() {
        return interval(10000).pipe(
            mergeMap(async () => {
                return {
                    data: {
                        response: await this.heathCheck,
                    },
                };
            }),
        );
    }

    private get heathCheck() {
        return this.health.check([
            () => this.mongodbHealth.pingCheck('mongoose'),
            () => this.maintenanceHealth.isHealthy('maintenance_mode'),
            () => this.memoryHealth.checkHeap('memory_heap', 200 * 1024 * 1024),
            () => this.memoryHealth.checkRSS('memory_rss', 3000 * 1024 * 1024),
            () => {
                let redisHostAndPort = this.configService.get(RedisClientEnum.REDIS_SESSION).split('redis://');
                redisHostAndPort = redisHostAndPort[1].split(':');
                return this.microserviceHealth.pingCheck('redis_server', {
                    transport: Transport.REDIS,
                    options: { host: redisHostAndPort[0], port: Number(redisHostAndPort[1].split('/')[0]) },
                });
            },
            () =>
                this.microserviceHealth.pingCheck('microservices', {
                    transport: Transport.RMQ,
                    options: { urls: [this.configService.get('RABBIT_MQ_URI')] },
                }),
        ]);
    }
}
