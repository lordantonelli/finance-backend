import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { QueryActiveListDto } from '@shared/dto/query-active-list.dto';
import { GoalType } from '../entities/goal-type.enum';

export class QueryTypeListDto extends QueryActiveListDto {
  @ApiProperty({
    required: false,
    description: 'Filter by goal type',
    enum: GoalType,
  })
  @IsOptional()
  @IsEnum(GoalType)
  type?: GoalType;
}
