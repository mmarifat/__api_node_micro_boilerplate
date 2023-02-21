import { Global, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@gateway/src/heath/health.controller';
import { MaintenanceHealthIndicator } from '@packages/health-indicators';

@Global()
@Module({
    imports: [
        TerminusModule.forRoot({
            errorLogStyle: 'pretty',
        }),
    ],
    controllers: [HealthController],
    providers: [MaintenanceHealthIndicator],
})
export class HealthModule {}
