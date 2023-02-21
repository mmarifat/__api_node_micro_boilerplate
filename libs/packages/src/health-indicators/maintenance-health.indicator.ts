import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MaintenanceHealthIndicator extends HealthIndicator {
    constructor(private readonly configService: ConfigService) {
        super();
    }
    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        const maintenanceMode = this.configService.get<string>('MAINTENANCE_MODE') === 'true';
        const result = this.getStatus(key, !maintenanceMode);
        if (!maintenanceMode) return result;
        throw new HealthCheckError('Maintenance Mode On', result);
    }
}
