import { ApiProperty } from '@nestjs/swagger';

export class MonthlySummaryItemDto {
  @ApiProperty({ description: 'Year (YYYY)' })
  year: string;

  @ApiProperty({ description: 'Month (MM)' })
  month: string;

  @ApiProperty({ description: 'Total income for the month', example: 1000 })
  income: number;

  @ApiProperty({ description: 'Total expenses for the month', example: 800 })
  expenses: number;

  @ApiProperty({
    description: 'Balance of the month (income - expenses)',
    example: 200,
  })
  monthBalance: number;

  @ApiProperty({
    description: 'Accumulated balance up to this month',
    example: 500,
  })
  accumulatedBalance: number;

  @ApiProperty({
    description:
      'Net transfers affecting the account this month (incoming - outgoing). Only populated when filtering by a specific account or in per-account breakdown.',
    required: false,
    example: 150,
  })
  netTransfers?: number;

  @ApiProperty({
    description:
      'Month balance including transfers (monthBalance + netTransfers). Only populated when filtering by a specific account or in per-account breakdown.',
    required: false,
    example: 350,
  })
  monthBalanceWithTransfers?: number;

  @ApiProperty({
    description:
      'Accumulated balance including transfers up to this month. Only populated when filtering by a specific account or in per-account breakdown.',
    required: false,
    example: 650,
  })
  accumulatedBalanceWithTransfers?: number;
}

export class AccountMonthlySummaryDto {
  @ApiProperty({ description: 'Account ID' })
  accountId: number;

  @ApiProperty({ description: 'Account name' })
  accountName: string;

  @ApiProperty({
    description: 'Monthly items for this account',
    type: [MonthlySummaryItemDto],
  })
  items: MonthlySummaryItemDto[];

  @ApiProperty({
    description: 'Total income in the period for this account',
    example: 2500,
  })
  totalIncome: number;

  @ApiProperty({
    description: 'Total expenses in the period for this account',
    example: 2100,
  })
  totalExpenses: number;

  @ApiProperty({
    description: 'Total savings in the period for this account',
    example: 400,
  })
  totalSavings: number;
}

export class MonthlySummaryDto {
  @ApiProperty({ description: 'Start month (YYYY-MM)' })
  startMonth: string;

  @ApiProperty({ description: 'End month (YYYY-MM)' })
  endMonth: string;

  @ApiProperty({
    description: 'Monthly summary items',
    type: [MonthlySummaryItemDto],
  })
  items: MonthlySummaryItemDto[];

  @ApiProperty({ description: 'Total income in the period', example: 5000 })
  totalIncome: number;

  @ApiProperty({ description: 'Total expenses in the period', example: 4200 })
  totalExpenses: number;

  @ApiProperty({
    description: 'Total savings in the period (income - expenses)',
    example: 800,
  })
  totalSavings: number;

  @ApiProperty({
    description: 'Monthly summary by account (optional)',
    required: false,
    type: () => [AccountMonthlySummaryDto],
  })
  accounts?: AccountMonthlySummaryDto[];
}
