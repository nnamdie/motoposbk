import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test'),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return application info', () => {
    const info = service.getApplicationInfo();

    expect(info).toHaveProperty('name');
    expect(info).toHaveProperty('version');
    expect(info).toHaveProperty('environment');
    expect(info).toHaveProperty('timestamp');
    expect(info).toHaveProperty('uptime');
    expect(info).toHaveProperty('memory');
    expect(info).toHaveProperty('node');

    expect(info.name).toBe('Multi-tenant EPOS API');
    expect(configService.get).toHaveBeenCalledWith('NODE_ENV');
  });
});
