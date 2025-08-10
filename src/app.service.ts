import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo(): { message: string; version: string; timestamp: string } {
    return {
      message: 'Multi-tenant EPOS API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
