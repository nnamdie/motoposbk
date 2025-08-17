import { ApiProperty } from '@nestjs/swagger';

import { PERMISSIONS } from '../decorators/permissions.decorator';
import { BusinessContextDto } from './business-context.response.dto';
import { UserDto } from './user.response.dto';

export class UserProfileDto extends UserDto {
  @ApiProperty({ type: BusinessContextDto })
  business!: BusinessContextDto;

  @ApiProperty({
    example: [PERMISSIONS.ITEMS.CREATE, PERMISSIONS.ORDERS.MANAGE],
  })
  permissions!: string[];

  @ApiProperty({ example: ['Manager', 'Sales'] })
  roles!: string[];
}
