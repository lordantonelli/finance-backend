import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { QuerySearchDto } from './query-search.dto';

export class QueryListDto extends QuerySearchDto implements IPaginationOptions {
  @ApiPropertyOptional({ description: 'Page number for pagination' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Field name to order by',
    example: 'date',
  })
  @IsString()
  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional({
    description: 'Ordering direction',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order?: 'ASC' | 'DESC';
}
