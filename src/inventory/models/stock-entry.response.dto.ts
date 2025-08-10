import { ApiProperty } from '@nestjs/swagger';

export class StockEntryResponseDto {
  @ApiProperty({ example: 456 })
  id!: number;

  @ApiProperty({ example: 123 })
  itemId!: number;

  @ApiProperty({ example: 'Samsung Galaxy S24' })
  itemName!: string;

  @ApiProperty({ example: 'SAM256PRO240001' })
  itemSku!: string;

  @ApiProperty({ example: 'Incoming' })
  type!: string;

  @ApiProperty({ example: 10 })
  quantity!: number;

  @ApiProperty({ example: 5 })
  previousStock!: number;

  @ApiProperty({ example: 15 })
  newStock!: number;

  @ApiProperty({ example: 80000000, description: 'Unit cost in kobo' })
  unitCost?: number;

  @ApiProperty({ example: 'PO-2024-001' })
  reference?: string;

  @ApiProperty({ example: 'Received from supplier' })
  notes?: string;

  @ApiProperty({ example: 'Completed' })
  status!: string;

  @ApiProperty({ example: 'John Doe' })
  processedByName?: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  processedAt?: string;

  @ApiProperty({ example: 'ABC Electronics Ltd' })
  supplier?: string;

  @ApiProperty({ example: '2025-12-31T23:59:59.000Z' })
  expiryDate?: string;

  @ApiProperty({ example: 'BATCH-2024-001' })
  batchNumber?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;
}
