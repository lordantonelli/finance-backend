import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from 'src/categories/entities/category-type.enum';

export class CategoryTotalDto {
  @ApiProperty({ description: 'Category ID' })
  categoryId: number;

  @ApiProperty({ description: 'Category name' })
  categoryName: string;

  @ApiProperty({ description: 'Category type', enum: CategoryType })
  categoryType: CategoryType;

  @ApiProperty({ description: 'Total amount for this category in the period' })
  total: number;

  @ApiProperty({ description: 'Number of transactions in this category' })
  transactionCount: number;
}

export class PeriodReportDto {
  @ApiPropertyOptional({
    description: 'Account ID (omitted when aggregating all accounts)',
  })
  accountId?: number;

  @ApiPropertyOptional({
    description:
      'Account name (omitted or set to a generic label when aggregating all accounts)',
  })
  accountName?: string;

  @ApiProperty({ description: 'Start date of the period', format: 'date' })
  startDate: string;

  @ApiProperty({ description: 'End date of the period', format: 'date' })
  endDate: string;

  @ApiProperty({
    description: 'Balance before the start of the period',
    example: 1000.0,
  })
  previousBalance: number;

  @ApiProperty({
    description: 'Balance at the end of the period',
    example: 1500.0,
  })
  currentBalance: number;

  @ApiProperty({
    description: 'Total income in the period',
    example: 3000.0,
  })
  totalIncome: number;

  @ApiProperty({
    description: 'Total expenses in the period',
    example: 2500.0,
  })
  totalExpenses: number;

  @ApiProperty({
    description: 'Savings in the period (income - expenses)',
    example: 500.0,
  })
  savings: number;

  @ApiProperty({
    description: 'List of totals by category',
    type: [CategoryTotalDto],
  })
  categorySummary: CategoryTotalDto[];
}
