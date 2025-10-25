import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { GoalType } from 'src/goals/entities/goal-type.enum';
import { StartBeforeOrEqualEnd } from '@shared/decorators';

export class CreateGoalDto {
  @ApiProperty({
    description:
      'Type of the goal:' +
      'POUPANCA (accumulated balance = previous balance + income - expenses), ' +
      'INVESTIMENTO (sum of transactions in "Investimentos" category and subcategories), ' +
      'DIVIDA (net balance of period = income - expenses), ' +
      'COMPRA (sum of transactions in "Compras" category and subcategories), ' +
      'ORCAMENTO (total expenses in period)',
    enum: GoalType,
  })
  @IsEnum(GoalType)
  type: GoalType;

  @ApiProperty({ description: 'Target value to reach', example: 5000 })
  @IsNumber()
  @IsPositive()
  targetValue: number;

  @ApiProperty({
    description: 'Start date (YYYY-MM-DD)',
    example: '2025-01-01',
    type: 'string',
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'End date (YYYY-MM-DD)',
    example: '2025-12-31',
    type: 'string',
    format: 'date',
  })
  @IsDate()
  @IsNotEmpty()
  @StartBeforeOrEqualEnd('startDate', 'date')
  endDate: Date;

  @ApiPropertyOptional({ description: 'Goal description' })
  @IsOptional()
  @IsString()
  description?: string;
}
