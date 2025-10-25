import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsObject,
  IsPositive,
  MaxDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DifferentField, ExistsAndBelongsToUser } from '@shared/decorators';
import { RelationEntityDto } from '@shared/dto/relation-entity.dto';
import { Account } from 'src/accounts/entities/account.entity';

export class CreateTransferDto {
  @ApiProperty({
    description: 'The account associated with the transaction',
    type: RelationEntityDto,
  })
  @ValidateNested()
  @Type(() => RelationEntityDto)
  @IsObject()
  @ExistsAndBelongsToUser(Account)
  account: Account;

  @ApiProperty({
    description: 'Destination account',
    type: RelationEntityDto,
  })
  @DifferentField('account')
  @ValidateNested()
  @Type(() => RelationEntityDto)
  @IsObject()
  @ExistsAndBelongsToUser(Account)
  toAccount: Account;

  @ApiProperty({
    description: 'Transfer amount (must be positive)',
    example: 500.0,
  })
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'The date of the transaction',
    example: '2024-01-01',
    type: 'string',
    format: 'date',
  })
  @IsDate()
  @MaxDate(new Date())
  @IsNotEmpty()
  date: Date;
}
