import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CategoryType } from '../entities/category-type.enum';
import { QueryActiveListDto } from '@shared/dto/query-active-list.dto';

export class QueryTypeListDto extends QueryActiveListDto {
  @ApiProperty({
    required: false,
    description: 'Filter by category type (INCOME/EXPENSE)',
    enum: CategoryType,
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}
