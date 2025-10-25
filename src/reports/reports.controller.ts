import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PeriodReportQueryDto } from './dto/period-report-query.dto';
import { PeriodReportDto } from './dto/period-report.dto';
import { MonthlySummaryDto } from './dto/monthly-summary.dto';
import { MonthlySummaryQueryDto } from './dto/monthly-summary.query.dto';
import { FilterByOwner } from '@shared/decorators';
import { GoalProgressReportDto } from './dto/goal-progress-report.dto';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
@FilterByOwner()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('transactions/period')
  @ApiOperation({
    summary: 'Generate period report for an account',
    description:
      'Generates a financial report for a specific account and period, including totals by category, previous balance, current balance, and savings',
  })
  @ApiOkResponse({
    description: 'Period report generated successfully',
    type: PeriodReportDto,
  })
  async getPeriodReport(
    @Query() query: PeriodReportQueryDto,
  ): Promise<PeriodReportDto> {
    return this.reportsService.generatePeriodReport(
      query.accountId,
      query.startDate,
      query.endDate,
    );
  }

  @Get('transactions/monthly')
  @ApiOperation({
    summary: 'Monthly income/expenses summary',
    description:
      'Returns totals of income and expenses per month, monthly balance (income - expenses), and accumulated balance. Filter by startMonth and endMonth (YYYY-MM).',
  })
  @ApiOkResponse({ description: 'Monthly summary', type: MonthlySummaryDto })
  async getMonthlySummary(
    @Query() query: MonthlySummaryQueryDto,
  ): Promise<MonthlySummaryDto> {
    return this.reportsService.getMonthlySummary(
      query.startMonth,
      query.endMonth,
      query.accountId,
    );
  }

  @ApiOkResponse({ type: [GoalProgressReportDto] })
  @ApiOperation({
    summary: 'Get progress report for all goals',
    description:
      'Returns a detailed progress report for each goal, including accumulated value, target value, progress percentage, and current status',
  })
  @Get('golas/progress')
  async getProgressReport(): Promise<GoalProgressReportDto[]> {
    return this.reportsService.getProgressReport();
  }
}
