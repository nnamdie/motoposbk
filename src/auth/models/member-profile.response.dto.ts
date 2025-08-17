import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from './user.response.dto';

export class MemberResponseDto {
  @ApiProperty({
    description: 'Member ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Member position in the business',
    example: 'Manager',
  })
  position?: string;

  @ApiProperty({
    description: 'User information',
    type: UserDto,
  })
  user!: UserDto;
}
