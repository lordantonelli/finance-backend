import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsPositive,
  IsString,
  Length,
  MaxDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RelationEntityDto } from '@shared/dto/relation-entity.dto';
import { Category } from 'src/categories/entities/category.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { ExistsAndBelongsToUser } from '@shared/decorators';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'The account associated with the transaction',
    type: RelationEntityDto,
  })
  @ValidateNested()
  @Type(() => RelationEntityDto)
  @IsObject()
  @ExistsAndBelongsToUser(Account)
  account: Account;

  @ApiProperty({ description: 'The amount of the transaction', example: 100.5 })
  @IsNumber()
  @IsPositive()
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

  @ApiProperty({
    description: 'A brief description of the transaction',
    example: 'Grocery shopping at SuperMart',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  description: string;

  @ApiProperty({
    description: 'The category associated with the transaction',
    type: RelationEntityDto,
  })
  @ValidateNested()
  @Type(() => RelationEntityDto)
  @IsObject()
  @ExistsAndBelongsToUser(Category)
  category: Category;
}
