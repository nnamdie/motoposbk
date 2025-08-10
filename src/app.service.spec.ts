import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return API info', () => {
    const result = service.getApiInfo();

    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('timestamp');
    expect(result.message).toBe('Multi-tenant EPOS API is running');
  });
});
