import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from '@shared/decorators';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { User } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'Name of the user', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsUnique(User)
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    minLength: 4,
    maxLength: 20,
    example: 'StrongP@ssword1',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'URL or path to user avatar image',
    example: 'https://example.com/avatars/user123.jpg',
  })
  @IsUrl()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Preferred currency code (ISO 4217)',
    example: 'BRL',
    maxLength: 3,
  })
  @IsString()
  @MaxLength(3)
  @IsOptional()
  currency?: string;
}
