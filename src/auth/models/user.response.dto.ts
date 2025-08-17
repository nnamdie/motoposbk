import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
  @ApiProperty({ example: 123 })
  id!: number;

  @ApiProperty({ example: 'John' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ example: '+2348012345678' })
  phone!: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatar?: string;
}