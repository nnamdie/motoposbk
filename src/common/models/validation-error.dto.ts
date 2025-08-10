import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({
    example: [
      {
        property: 'email',
        value: 'invalid-email',
        constraints: {
          isEmail: 'email must be an email',
        },
      },
    ],
  })
  details?: any[];

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/users' })
  path: string;

  @ApiProperty({ example: 'POST' })
  method: string;
}
