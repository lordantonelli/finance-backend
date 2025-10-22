import {
  IsDefined,
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { AccountType } from '../entities/account-type.enum';
import { IsUnique } from '@shared/decorators';
import { Account } from '../entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ description: 'Name of the account' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  @IsUnique(Account, ['name', 'user'])
  name: string;

  @ApiProperty({ description: 'Initial balance of the account' })
  @IsNumber()
  initialBalance: number;

  @ApiProperty({ description: 'Type of the account', enum: AccountType })
  @IsEnum(AccountType)
  @IsDefined()
  type: AccountType;

  @ApiProperty({
    description: 'Color of the account',
    example: '#FF5733',
    format: 'hex-color',
    type: 'string',
  })
  @IsHexColor()
  color: string;

  @ApiProperty({ description: 'Icon of the category' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  icon?: string;
}
