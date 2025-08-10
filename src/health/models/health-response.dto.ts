import { ApiProperty } from '@nestjs/swagger';

export class HealthIndicatorDto {
  @ApiProperty({ example: 'up' })
  status: string;

  @ApiProperty({
    example: { connection: 'up' },
    description: 'Additional indicator properties',
  })
  details?: Record<string, any>;
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: { database: { status: 'up' } } })
  info: Record<string, HealthIndicatorDto>;

  @ApiProperty({ example: {} })
  error: Record<string, HealthIndicatorDto>;

  @ApiProperty({ example: { database: { status: 'up' } } })
  details: Record<string, HealthIndicatorDto>;
}
