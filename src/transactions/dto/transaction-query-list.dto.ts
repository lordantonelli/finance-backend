import { Category } from './../../categories/entities/category.entity';
import { QueryListDto } from '@shared/dto/query-list.dto';
import { CategoryType } from '../../categories/entities/category-type.enum';
import { Account } from 'src/accounts/entities/account.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionQueryListDto extends QueryListDto {
  @ApiPropertyOptional({
    description: 'Filter by category ID',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  category?: Category;

  @ApiPropertyOptional({
    description: 'Filter by initial date',
    type: String,
    format: 'date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  initialDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by final date',
    type: String,
    format: 'date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  finalDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by type of transaction: income or expense',
    enum: CategoryType,
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional({
    description: 'Filter by account ID',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  account?: Account;
}
