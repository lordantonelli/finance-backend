import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsDefined()
  password: string;
}
