import { QueryListDto } from '@shared/dto/query-list.dto';
import { Account } from 'src/accounts/entities/account.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { StartBeforeOrEqualEnd } from '@shared/decorators';

export class TransactionQueryListDto extends QueryListDto {
  @ApiPropertyOptional({
    description: 'Filter by initial date',
    type: String,
    format: 'date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by final date',
    type: String,
    format: 'date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDate()
  @StartBeforeOrEqualEnd('startDate', 'date')
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by account ID',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  account?: Account;
}
