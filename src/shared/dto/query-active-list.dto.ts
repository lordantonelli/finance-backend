import { ApiProperty } from '@nestjs/swagger';
import { QueryListDto } from '@shared/dto/query-list.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryActiveListDto extends QueryListDto {
  @ApiProperty({ required: false, description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
