import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { QueryActiveListDto } from '@shared/dto/query-active-list.dto';
import { GoalType } from '../entities/goal-type.enum';

export class QueryTypeListDto extends QueryActiveListDto {
  @ApiProperty({
    description:
      'filter by type of the goal:' +
      'POUPANCA (accumulated balance = previous balance + income - expenses), ' +
      'INVESTIMENTO (sum of transactions in "Investimentos" category and subcategories), ' +
      'DIVIDA (net balance of period = income - expenses), ' +
      'COMPRA (sum of transactions in "Compras" category and subcategories), ' +
      'ORCAMENTO (total expenses in period)',
    enum: GoalType,
    required: false,
  })
  @IsOptional()
  @IsEnum(GoalType)
  type?: GoalType;
}
