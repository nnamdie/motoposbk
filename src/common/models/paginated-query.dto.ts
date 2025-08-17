import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginatedQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'DESC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ example: 'search term' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'status' })
  @IsOptional()
  status?: string;

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
