import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionQueryListDto } from './transaction-query-list.dto';
import { Account } from 'src/accounts/entities/account.entity';

export class TransferTransactionQueryListDto extends TransactionQueryListDto {
  @ApiPropertyOptional({
    description: 'Filter by to account ID',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  toAccount?: Account;
}
