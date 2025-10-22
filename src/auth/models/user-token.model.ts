import { ApiProperty } from '@nestjs/swagger';

export class UserToken {
  @ApiProperty({ description: 'Access token for the authenticated user' })
  access_token: string;

  @ApiProperty({ description: 'Type of the token', example: 'Bearer' })
  token_type: string;
}
