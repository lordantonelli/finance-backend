import { ApiProperty } from '@nestjs/swagger';
import { QueryListDto } from '@shared/dto/query-list.dto';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { CategoryType } from '../entities/category-type.enum';

export class QueryActiveListDto extends QueryListDto {
  @ApiProperty({ required: false, description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    required: false,
    description: 'Filter by category type',
    enum: CategoryType,
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}
