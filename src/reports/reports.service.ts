import { Injectable } from '@nestjs/common';
import { StandardTransaction } from 'src/transactions/entities/standard-transaction.entity';
import { TransferTransaction } from 'src/transactions/entities/transfer-transaction.entity';
import { PeriodReportDto, CategoryTotalDto } from './dto/period-report.dto';
import { CategoryType } from 'src/categories/entities/category-type.enum';
import { AccountsService } from 'src/accounts/accounts.service';
import { StandardTransactionsService } from '../transactions/standard-transactions.service';
import {
  MonthlySummaryDto,
  MonthlySummaryItemDto,
} from './dto/monthly-summary.dto';
import { AppContextService } from '@shared/services/app-context.service';
import { GoalProgressReportDto } from './dto/goal-progress-report.dto';
import { GoalsService } from 'src/goals/goals.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly standardTransactionsService: StandardTransactionsService,
    private readonly appContext: AppContextService,
    private readonly goalsService: GoalsService,
  ) {}

  async generatePeriodReport(
    accountId: number | undefined,
    startDate: string,
    endDate: string,
  ): Promise<PeriodReportDto> {
    const start = startDate; // YYYY-MM-DD
    const end = endDate; // YYYY-MM-DD

    // If a specific account is provided, compute per-account report
    if (accountId) {
      // Verify account exists and belongs to user
      const account = await this.accountsService.findOne(accountId);

      // Get standard transactions within the period (joined with category)
      const transactions = (await this.standardTransactionsService
        .getRepository()
        .createQueryBuilder('t')
        .innerJoin('t.account', 'a')
        .leftJoinAndSelect('t.category', 'c')
        .where('a.id = :accountId', { accountId })
        .andWhere('t.type = :std', { std: 'StandardTransaction' })
        .andWhere('t.date BETWEEN :start AND :end', { start, end })
        .orderBy('t.date', 'ASC')
        .getMany()) as unknown as StandardTransaction[];

      // Get standard transactions before the period to calculate previous balance
      const transactionsBeforePeriod = (await this.standardTransactionsService
        .getRepository()
        .createQueryBuilder('t')
        .innerJoin('t.account', 'a')
        .leftJoinAndSelect('t.category', 'c')
        .where('a.id = :accountId', { accountId })
        .andWhere('t.type = :std', { std: 'StandardTransaction' })
        .andWhere('t.date < :start', { start })
        .getMany()) as unknown as StandardTransaction[];

      // Also get transfer transactions before the period (affect balance only)
      const transfersBeforePeriod = (await this.standardTransactionsService
        .getRepository()
        .createQueryBuilder('t')
        .innerJoin('t.account', 'a')
        .where('a.id = :accountId', { accountId })
        .andWhere('t.type = :tt', { tt: 'TransferTransaction' })
        .andWhere('t.date < :start', { start })
        .select(['t.id', 't.amount', 't.description'])
        .getMany()) as unknown as TransferTransaction[];

      // Calculate previous balance (includes transfers before the period)
      let previousBalance = account.initialBalance;
      transactionsBeforePeriod.forEach((transaction) => {
        if (!transaction.category) return;
        if (transaction.category.type === CategoryType.INCOME) {
          previousBalance += transaction.amount;
        } else {
          previousBalance -= transaction.amount;
        }
      });
      // Apply transfer effects: outgoing decreases, incoming increases
      const isIncoming = (desc?: string | null) =>
        typeof desc === 'string' && desc.startsWith('Transferência de Entrada');
      transfersBeforePeriod.forEach((t) => {
        previousBalance += isIncoming(t.description) ? t.amount : -t.amount;
      });

      // Calculate totals by category
      const categoryMap = new Map<number, CategoryTotalDto>();
      let totalIncome = 0;
      let totalExpenses = 0;

      transactions.forEach((transaction) => {
        if (!transaction.category) return;
        const categoryId = transaction.category.id;
        const isIncome = transaction.category.type === CategoryType.INCOME;

        // Update totals
        if (isIncome) {
          totalIncome += transaction.amount;
        } else {
          totalExpenses += transaction.amount;
        }

        // Update category summary
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            categoryId,
            categoryName: transaction.category.name,
            categoryType: transaction.category.type,
            total: 0,
            transactionCount: 0,
          });
        }

        const categoryTotal = categoryMap.get(categoryId)!;
        categoryTotal.total += transaction.amount;
        categoryTotal.transactionCount += 1;
      });

      // Get transfer transactions within the period to adjust current balance
      const transfersInPeriod = (await this.standardTransactionsService
        .getRepository()
        .createQueryBuilder('t')
        .innerJoin('t.account', 'a')
        .where('a.id = :accountId', { accountId })
        .andWhere('t.type = :tt', { tt: 'TransferTransaction' })
        .andWhere('t.date BETWEEN :start AND :end', { start, end })
        .select(['t.id', 't.amount', 't.description'])
        .orderBy('t.date', 'ASC')
        .getMany()) as unknown as TransferTransaction[];

      const netTransfersInPeriod = transfersInPeriod.reduce((sum, t) => {
        return sum + (isIncoming(t.description) ? t.amount : -t.amount);
      }, 0);

      // Calculate current balance (income/expenses + net transfers in period)
      const currentBalance =
        previousBalance + (totalIncome - totalExpenses) + netTransfersInPeriod;

      // Calculate savings
      const savings = totalIncome - totalExpenses;

      return {
        accountId: account.id,
        accountName: account.name,
        startDate,
        endDate,
        previousBalance,
        currentBalance,
        totalIncome,
        totalExpenses,
        savings,
        categorySummary: Array.from(categoryMap.values()).sort(
          (a, b) => b.total - a.total,
        ),
      };
    }

    // Aggregate across all accounts of the current user
    const userId = this.appContext.currentUserId;

    // Sum initial balances for user's accounts
    const rawInit = await this.accountsService
      .getRepository()
      .createQueryBuilder('a')
      .innerJoin('a.user', 'u')
      .where('u.id = :userId', { userId })
      .select('COALESCE(SUM(a.initialBalance), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    let previousBalance = Number(rawInit?.sum ?? 0);

    // Standard transactions before the period across all accounts
    const stdBefore = (await this.standardTransactionsService
      .getRepository()
      .createQueryBuilder('t')
      .innerJoin('t.account', 'a')
      .innerJoin('a.user', 'u')
      .leftJoinAndSelect('t.category', 'c')
      .where('u.id = :userId', { userId })
      .andWhere('t.type = :std', { std: 'StandardTransaction' })
      .andWhere('t.date < :start', { start })
      .getMany()) as unknown as StandardTransaction[];

    stdBefore.forEach((transaction) => {
      if (!transaction.category) return;
      if (transaction.category.type === CategoryType.INCOME) {
        previousBalance += transaction.amount;
      } else {
        previousBalance -= transaction.amount;
      }
    });

    // Standard transactions within the period across all accounts
    const transactions = (await this.standardTransactionsService
      .getRepository()
      .createQueryBuilder('t')
      .innerJoin('t.account', 'a')
      .innerJoin('a.user', 'u')
      .leftJoinAndSelect('t.category', 'c')
      .where('u.id = :userId', { userId })
      .andWhere('t.type = :std', { std: 'StandardTransaction' })
      .andWhere('t.date BETWEEN :start AND :end', { start, end })
      .orderBy('t.date', 'ASC')
      .getMany()) as unknown as StandardTransaction[];

    // Calculate totals by category across all accounts
    const categoryMap = new Map<number, CategoryTotalDto>();
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      if (!transaction.category) return;
      const categoryId = transaction.category.id;
      const isIncome = transaction.category.type === CategoryType.INCOME;

      if (isIncome) totalIncome += transaction.amount;
      else totalExpenses += transaction.amount;

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName: transaction.category.name,
          categoryType: transaction.category.type,
          total: 0,
          transactionCount: 0,
        });
      }
      const categoryTotal = categoryMap.get(categoryId)!;
      categoryTotal.total += transaction.amount;
      categoryTotal.transactionCount += 1;
    });

    const currentBalance = previousBalance + (totalIncome - totalExpenses);
    const savings = totalIncome - totalExpenses;

    return {
      // accountId and accountName omitted for all-accounts aggregate
      accountName: 'Todas as contas',
      startDate,
      endDate,
      previousBalance,
      currentBalance,
      totalIncome,
      totalExpenses,
      savings,
      categorySummary: Array.from(categoryMap.values()).sort(
        (a, b) => b.total - a.total,
      ),
    };
  }

  /**
   * Returns monthly totals of income and expenses, monthly balance (income-expenses),
   * and accumulated balance across the period. Filters by startMonth and endMonth (YYYY-MM).
   */
  async getMonthlySummary(
    startMonth: string,
    endMonth: string,
    accountId?: number,
  ): Promise<MonthlySummaryDto> {
    // Build date range: first day of startMonth to last day of endMonth
    const startDate = new Date(`${startMonth}-01T00:00:00.000Z`);
    const endMonthParts = endMonth.split('-').map((p) => parseInt(p, 10));
    const endYear = endMonthParts[0];
    const endMonthNum = endMonthParts[1];
    const firstOfNextMonth = new Date(Date.UTC(endYear, endMonthNum, 1)); // months are 0-based
    const endDate = new Date(firstOfNextMonth.getTime() - 1); // last ms of endMonth

    const userId = this.appContext.currentUserId;

    // SQLite: use strftime to group by year and month
    const qb = this.standardTransactionsService
      .getRepository()
      .createQueryBuilder('t')
      .innerJoin('t.account', 'a')
      .innerJoin('a.user', 'u')
      .leftJoin('t.category', 'c')
      .where('u.id = :userId', { userId })
      .andWhere('t.type = :std', { std: 'StandardTransaction' })
      .andWhere('t.date BETWEEN :start AND :end', {
        start: startDate.toISOString().slice(0, 10),
        end: endDate.toISOString().slice(0, 10),
      })
      .andWhere(accountId ? 'a.id = :accountId' : '1=1', {
        accountId,
      })
      .select("strftime('%Y', t.date)", 'year')
      .addSelect("strftime('%m', t.date)", 'month')
      .addSelect(
        'COALESCE(SUM(CASE WHEN c.type = :income THEN t.amount ELSE 0 END), 0)',
        'income',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN c.type = :expense THEN t.amount ELSE 0 END), 0)',
        'expenses',
      )
      .setParameters({
        income: CategoryType.INCOME,
        expense: CategoryType.EXPENSE,
      })
      .groupBy("strftime('%Y', t.date)")
      .addGroupBy("strftime('%m', t.date)")
      .orderBy("strftime('%Y', t.date)", 'ASC')
      .addOrderBy("strftime('%m', t.date)", 'ASC');

    const raw: Array<{
      year: string;
      month: string;
      income: string;
      expenses: string;
    }> = await qb.getRawMany();

    // Build a complete month list between start and end to include months with zero transactions
    const items: MonthlySummaryItemDto[] = [];
    let cursor = new Date(
      Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1),
    );
    const last = new Date(
      Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1),
    );
    const map = new Map<string, { income: number; expenses: number }>();
    for (const row of raw) {
      const key = `${row.year}-${row.month}`;
      map.set(key, {
        income: Number(row.income) || 0,
        expenses: Number(row.expenses) || 0,
      });
    }

    let accumulated = 0;
    while (cursor <= last) {
      const y = cursor.getUTCFullYear();
      const m = (cursor.getUTCMonth() + 1).toString().padStart(2, '0');
      const key = `${y}-${m}`;
      const income = map.get(key)?.income ?? 0;
      const expenses = map.get(key)?.expenses ?? 0;
      const monthBalance = income - expenses;
      accumulated += monthBalance;
      items.push({
        year: y.toString(),
        month: m,
        income,
        expenses,
        monthBalance,
        accumulatedBalance: accumulated,
      });
      // advance one month
      cursor = new Date(
        Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1),
      );
    }

    // If a specific account is requested, compute net transfers per month for that account
    let netTransfersByMonth: Map<string, number> | undefined;
    if (accountId) {
      const qbTransfers = this.standardTransactionsService
        .getRepository()
        .createQueryBuilder('t')
        .innerJoin('t.account', 'a')
        .innerJoin('a.user', 'u')
        .where('u.id = :userId', { userId })
        .andWhere('a.id = :accountId', { accountId })
        .andWhere('t.type = :tt', { tt: 'TransferTransaction' })
        .andWhere('t.date BETWEEN :start AND :end', {
          start: startDate.toISOString().slice(0, 10),
          end: endDate.toISOString().slice(0, 10),
        })
        .select("strftime('%Y', t.date)", 'year')
        .addSelect("strftime('%m', t.date)", 'month')
        .addSelect(
          "COALESCE(SUM(CASE WHEN t.description LIKE 'Transferência de Entrada%' THEN t.amount ELSE -t.amount END), 0)",
          'net',
        )
        .groupBy("strftime('%Y', t.date)")
        .addGroupBy("strftime('%m', t.date)")
        .orderBy("strftime('%Y', t.date)", 'ASC')
        .addOrderBy("strftime('%m', t.date)", 'ASC');

      const rawNet: Array<{ year: string; month: string; net: string }> =
        await qbTransfers.getRawMany();
      netTransfersByMonth = new Map<string, number>();
      for (const r of rawNet) {
        netTransfersByMonth.set(`${r.year}-${r.month}`, Number(r.net) || 0);
      }
    }

    // Merge net transfers into overall items when available
    if (netTransfersByMonth) {
      let accWithTransfers = 0;
      for (const it of items) {
        const key = `${it.year}-${it.month}`;
        const net = netTransfersByMonth.get(key) ?? 0;
        it.netTransfers = net;
        it.monthBalanceWithTransfers = it.monthBalance + net;
        accWithTransfers += it.monthBalanceWithTransfers;
        it.accumulatedBalanceWithTransfers = accWithTransfers;
      }
    }

    const totalIncome = items.reduce((s, it) => s + it.income, 0);
    const totalExpenses = items.reduce((s, it) => s + it.expenses, 0);
    const totalSavings = totalIncome - totalExpenses;

    // Per-account breakdown (optional)
    const qbAccounts = this.standardTransactionsService
      .getRepository()
      .createQueryBuilder('t')
      .innerJoin('t.account', 'a')
      .innerJoin('a.user', 'u')
      .leftJoin('t.category', 'c')
      .where('u.id = :userId', { userId })
      .andWhere('t.type = :std', { std: 'StandardTransaction' })
      .andWhere('t.date BETWEEN :start AND :end', {
        start: startDate.toISOString().slice(0, 10),
        end: endDate.toISOString().slice(0, 10),
      })
      .andWhere(accountId ? 'a.id = :accountId' : '1=1', {
        accountId,
      })
      .select('a.id', 'accountId')
      .addSelect('a.name', 'accountName')
      .addSelect("strftime('%Y', t.date)", 'year')
      .addSelect("strftime('%m', t.date)", 'month')
      .addSelect(
        'COALESCE(SUM(CASE WHEN c.type = :income THEN t.amount ELSE 0 END), 0)',
        'income',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN c.type = :expense THEN t.amount ELSE 0 END), 0)',
        'expenses',
      )
      .setParameters({
        income: CategoryType.INCOME,
        expense: CategoryType.EXPENSE,
      })
      .groupBy('a.id')
      .addGroupBy('a.name')
      .addGroupBy("strftime('%Y', t.date)")
      .addGroupBy("strftime('%m', t.date)")
      .orderBy('a.name', 'ASC')
      .addOrderBy("strftime('%Y', t.date)", 'ASC')
      .addOrderBy("strftime('%m', t.date)", 'ASC');

    const rawAcc: Array<{
      accountId: number;
      accountName: string;
      year: string;
      month: string;
      income: string;
      expenses: string;
    }> = await qbAccounts.getRawMany();

    const accountsMap = new Map<
      number,
      {
        accountName: string;
        monthMap: Map<string, { income: number; expenses: number }>;
      }
    >();
    for (const r of rawAcc) {
      const accId = Number(r.accountId);
      const key = `${r.year}-${r.month}`;
      const entry = accountsMap.get(accId) ?? {
        accountName: r.accountName,
        monthMap: new Map(),
      };
      entry.monthMap.set(key, {
        income: Number(r.income) || 0,
        expenses: Number(r.expenses) || 0,
      });
      accountsMap.set(accId, entry);
    }

    // Per-account net transfers grouped by month
    const qbAccTransfers = this.standardTransactionsService
      .getRepository()
      .createQueryBuilder('t')
      .innerJoin('t.account', 'a')
      .innerJoin('a.user', 'u')
      .where('u.id = :userId', { userId })
      .andWhere('t.type = :tt', { tt: 'TransferTransaction' })
      .andWhere('t.date BETWEEN :start AND :end', {
        start: startDate.toISOString().slice(0, 10),
        end: endDate.toISOString().slice(0, 10),
      })
      .andWhere(accountId ? 'a.id = :accountId' : '1=1', { accountId })
      .select('a.id', 'accountId')
      .addSelect('a.name', 'accountName')
      .addSelect("strftime('%Y', t.date)", 'year')
      .addSelect("strftime('%m', t.date)", 'month')
      .addSelect(
        "COALESCE(SUM(CASE WHEN t.description LIKE 'Transferência de Entrada%' THEN t.amount ELSE -t.amount END), 0)",
        'net',
      )
      .groupBy('a.id')
      .addGroupBy('a.name')
      .addGroupBy("strftime('%Y', t.date)")
      .addGroupBy("strftime('%m', t.date)")
      .orderBy('a.name', 'ASC')
      .addOrderBy("strftime('%Y', t.date)", 'ASC')
      .addOrderBy("strftime('%m', t.date)", 'ASC');

    const rawAccNet: Array<{
      accountId: number;
      accountName: string;
      year: string;
      month: string;
      net: string;
    }> = await qbAccTransfers.getRawMany();

    const accountsNetMap = new Map<
      number,
      {
        accountName: string;
        monthMap: Map<string, { net: number }>;
      }
    >();
    for (const r of rawAccNet) {
      const accId = Number(r.accountId);
      const key = `${r.year}-${r.month}`;
      const entry = accountsNetMap.get(accId) ?? {
        accountName: r.accountName,
        monthMap: new Map(),
      };
      entry.monthMap.set(key, { net: Number(r.net) || 0 });
      accountsNetMap.set(accId, entry);
    }

    const accounts = Array.from(accountsMap.entries()).map(([accId, data]) => {
      let accAccum = 0;
      let accAccumWithTransfers = 0;
      const accItems: MonthlySummaryItemDto[] = [];
      let c = new Date(
        Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1),
      );
      const l = new Date(
        Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1),
      );
      while (c <= l) {
        const y = c.getUTCFullYear();
        const m = (c.getUTCMonth() + 1).toString().padStart(2, '0');
        const k = `${y}-${m}`;
        const inc = data.monthMap.get(k)?.income ?? 0;
        const exp = data.monthMap.get(k)?.expenses ?? 0;
        const bal = inc - exp;
        accAccum += bal;
        const net = accountsNetMap.get(accId)?.monthMap.get(k)?.net ?? 0;
        const balWithTransfers = bal + net;
        accAccumWithTransfers += balWithTransfers;
        accItems.push({
          year: y.toString(),
          month: m,
          income: inc,
          expenses: exp,
          monthBalance: bal,
          accumulatedBalance: accAccum,
          netTransfers: net,
          monthBalanceWithTransfers: balWithTransfers,
          accumulatedBalanceWithTransfers: accAccumWithTransfers,
        });
        c = new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() + 1, 1));
      }
      const accTotalIncome = accItems.reduce((s, it) => s + it.income, 0);
      const accTotalExpenses = accItems.reduce((s, it) => s + it.expenses, 0);
      const accTotalSavings = accTotalIncome - accTotalExpenses;
      return {
        accountId: accId,
        accountName: data.accountName,
        items: accItems,
        totalIncome: accTotalIncome,
        totalExpenses: accTotalExpenses,
        totalSavings: accTotalSavings,
      };
    });

    return {
      startMonth,
      endMonth,
      items,
      totalIncome,
      totalExpenses,
      totalSavings,
      accounts,
    };
  }

  async getProgressReport(): Promise<GoalProgressReportDto[]> {
    const userId = this.appContext.currentUserId;
    const goals = await this.goalsService.getRepository().find({
      where: { user: { id: userId } },
      order: { startDate: 'ASC' },
    });

    const today = new Date();
    const reports = await Promise.all(
      goals.map(async (goal) => {
        const accumulatedValue =
          await this.goalsService.calculateAccumulatedValue(goal);
        const progressPercentage = Math.min(
          100,
          Math.round((accumulatedValue / goal.targetValue) * 100),
        );
        const remainingValue = Math.max(0, goal.targetValue - accumulatedValue);
        const status = this.goalsService.calculateStatus(
          goal,
          accumulatedValue,
          today,
        );

        return {
          goal,
          targetValue: goal.targetValue,
          accumulatedValue,
          progressPercentage,
          status,
          remainingValue,
        };
      }),
    );

    return reports;
  }
}
