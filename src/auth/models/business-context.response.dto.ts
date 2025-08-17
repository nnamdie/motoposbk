import { ApiProperty } from "@nestjs/swagger";

export class BusinessContextDto {
  @ApiProperty({ example: 'ABC123' })
  ggId!: string;

  @ApiProperty({ example: 'Tech Solutions Ltd' })
  name!: string;

  @ApiProperty({ example: 'Active' })
  status!: string;

  @ApiProperty({ example: 'CEO' })
  position?: string;

  @ApiProperty({ example: true })
  isOwner!: boolean;
}