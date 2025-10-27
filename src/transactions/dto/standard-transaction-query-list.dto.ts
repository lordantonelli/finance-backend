import { Category } from '../../categories/entities/category.entity';
import { CategoryType } from '../../categories/entities/category-type.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionQueryListDto } from './transaction-query-list.dto';

export class StandardTransactionQueryListDto extends TransactionQueryListDto {
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
    description: 'Filter by type of transaction: income or expense',
    enum: CategoryType,
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}
