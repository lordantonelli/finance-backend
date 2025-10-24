import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { StartBeforeOrEqualEnd } from '@shared/decorators';
import { Type } from 'class-transformer';

export class PeriodReportQueryDto {
  @ApiPropertyOptional({
    description:
      'Account ID to generate report for. If omitted, aggregates all accounts of the current user.',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  accountId?: number;

  @ApiProperty({
    description: 'Start date of the period (YYYY-MM-DD)',
    example: '2024-01-01',
    type: 'string',
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'End date of the period (YYYY-MM-DD)',
    example: '2024-12-31',
    type: 'string',
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsDateString()
  @IsNotEmpty()
  @StartBeforeOrEqualEnd('startDate', 'date')
  endDate: string;
}
