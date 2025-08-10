import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getApplicationInfo() {
    return {
      name: 'Multi-tenant EPOS API',
      version: '1.0.0',
      environment: this.configService.get('NODE_ENV'),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node: process.version,
    };
  }
}
