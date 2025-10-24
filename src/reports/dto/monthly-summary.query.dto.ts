import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { StartBeforeOrEqualEndMonth } from '@shared/decorators';

// Normalize a YYYY-MM string ensuring month is clamped to 01..12 and zero-padded
function normalizeMonthString(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const match = value.match(/^(\d{4})-(\d{1,2})$/);
  if (!match) return value;
  const year = parseInt(match[1], 10);
  let month = parseInt(match[2], 10);
  if (Number.isNaN(year) || Number.isNaN(month)) return value;
  if (month < 1) month = 1;
  if (month > 12) month = 12;
  return `${year}-${month.toString().padStart(2, '0')}`;
}

export class MonthlySummaryQueryDto {
  @ApiProperty({
    description: 'Start month (YYYY-MM)',
    example: '2025-01',
    pattern: '^\\d{4}-\\d{2}$',
  })
  @IsNotEmpty()
  @Transform(({ value }) => normalizeMonthString(value))
  @Matches(/^\d{4}-\d{2}$/)
  startMonth: string;

  @ApiProperty({
    description: 'End month (YYYY-MM)',
    example: '2025-06',
    pattern: '^\\d{4}-\\d{2}$',
  })
  @IsNotEmpty()
  @Transform(({ value }) => normalizeMonthString(value))
  @Matches(/^\d{4}-\d{2}$/)
  @StartBeforeOrEqualEndMonth('startMonth')
  endMonth: string;

  @ApiPropertyOptional({
    description: 'Filter by a specific account ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  accountId?: number;
}
