import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QuerySearchDto {
  @ApiPropertyOptional({
    description:
      'Search term for filtering results (case-insensitive partial match)',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
