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
    summary: 'Generate account period report',
    description:
      'Generates a comprehensive financial report for a specific account and time period, including category breakdowns, balance changes, and savings calculations.',
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
    summary: 'Get monthly summary',
    description:
      'Returns aggregated income and expenses per month with monthly balance (income - expenses) and accumulated balance. Filter by date range using startMonth and endMonth (YYYY-MM format).',
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
    summary: 'Get goals progress report',
    description:
      'Returns a detailed progress report for all user goals, including accumulated value, target value, progress percentage, and current status for each goal type.',
  })
  @Get('goals/progress')
  async getProgressReport(): Promise<GoalProgressReportDto[]> {
    return this.reportsService.getProgressReport();
  }
}
