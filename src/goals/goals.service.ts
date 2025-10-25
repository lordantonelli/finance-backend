import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { BaseService } from '@shared/services/base.service';
import { Goal } from './entities/goal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppContextService } from '@shared/services/app-context.service';
import { GoalStatus } from './entities/goal-status.enum';
import { GoalType } from './entities/goal-type.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { CategoryType } from 'src/categories/entities/category-type.enum';
import { StandardTransaction } from 'src/transactions/entities/standard-transaction.entity';
import { AccountsService } from 'src/accounts/accounts.service';
import { CategoriesService } from 'src/categories/categories.service';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class GoalsService extends BaseService<Goal> {
  constructor(
    @InjectRepository(Goal)
    protected readonly repository: Repository<Goal>,
    protected appContext: AppContextService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
    private readonly accountsService: AccountsService,
    private readonly categoriesService: CategoriesService,
  ) {
    super(repository, appContext);
  }

  public async calculateAccumulatedValue(goal: Goal): Promise<number> {
    const userId = this.appContext.currentUserId;
    const today = new Date();

    // Use the earliest between today and goal end date for calculation
    console.log(goal);

    const effectiveEndDate =
      today.getTime() < goal.endDate.getTime() ? today : goal.endDate;

    // Get standard transactions in the goal period
    const transactions = (await this.transactionsService
      .getRepository()
      .createQueryBuilder('t')
      .innerJoin('t.account', 'a')
      .innerJoin('a.user', 'u')
      .leftJoinAndSelect('t.category', 'c')
      .where('u.id = :userId', { userId })
      .andWhere('t.type = :std', { std: 'StandardTransaction' })
      .andWhere('t.date BETWEEN :start AND :end', {
        start: goal.startDate,
        end: effectiveEndDate,
      })
      .getMany()) as unknown as StandardTransaction[];

    let accumulated = 0;

    switch (goal.type) {
      case GoalType.SAVINGS: {
        // Accumulated = previous balance before period + (income - expenses) in period
        // Previous balance = sum(initialBalance) + net of standard transactions before period across all accounts
        const rawInit = await this.accountsService
          .getRepository()
          .createQueryBuilder('a')
          .innerJoin('a.user', 'u')
          .where('u.id = :userId', { userId })
          .select('COALESCE(SUM(a.initialBalance), 0)', 'sum')
          .getRawOne<{ sum: string }>();
        let previousBalance = Number(rawInit?.sum ?? 0);

        const stdBefore = (await this.transactionsService
          .getRepository()
          .createQueryBuilder('t')
          .innerJoin('t.account', 'a')
          .innerJoin('a.user', 'u')
          .leftJoinAndSelect('t.category', 'c')
          .where('u.id = :userId', { userId })
          .andWhere('t.type = :std', { std: 'StandardTransaction' })
          .andWhere('t.date < :start', { start: goal.startDate })
          .getMany()) as unknown as StandardTransaction[];

        stdBefore.forEach((t) => {
          if (!t.category) return;
          if (t.category.type === CategoryType.INCOME) {
            previousBalance += t.amount;
          } else {
            previousBalance -= t.amount;
          }
        });

        const totalIncome = transactions
          .filter((t) => t.category && t.category.type === CategoryType.INCOME)
          .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
          .filter((t) => t.category && t.category.type === CategoryType.EXPENSE)
          .reduce((sum, t) => sum + t.amount, 0);

        accumulated = previousBalance + (totalIncome - totalExpenses);
        break;
      }

      case GoalType.INVESTMENT: {
        // Sum transactions from "Investimentos" category and its subcategories
        const userId = this.appContext.currentUserId;

        // Find the investment category (Investimentos) for the user
        const investmentCategory = await this.categoriesService
          .getRepository()
          .createQueryBuilder('c')
          .innerJoin('c.user', 'u')
          .where('u.id = :userId', { userId })
          .andWhere('LOWER(c.name) LIKE :name', { name: '%investimento%' })
          .getOne();

        if (!investmentCategory) {
          // No investment category found, return 0
          accumulated = 0;
          break;
        }

        // Get all descendants (subcategories) using TypeORM tree repository
        const treeRepo = this.categoriesService
          .getRepository()
          .manager.getTreeRepository(Category);
        const categoryTree =
          await treeRepo.findDescendantsTree(investmentCategory);

        // Collect all category IDs (parent + children)
        const collectIds = (cat: Category): number[] => {
          const ids = [cat.id];
          if (cat.children && cat.children.length > 0) {
            cat.children.forEach((child) => ids.push(...collectIds(child)));
          }
          return ids;
        };
        const categoryIds = collectIds(categoryTree);

        // Sum transactions from these categories
        accumulated = transactions
          .filter((t) => t.category && categoryIds.includes(t.category.id))
          .reduce((sum, t) => sum + t.amount, 0);
        break;
      }

      case GoalType.DEBT: {
        // Accumulated = net balance of period (income - expenses)
        const totalIncome = transactions
          .filter((t) => t.category && t.category.type === CategoryType.INCOME)
          .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
          .filter((t) => t.category && t.category.type === CategoryType.EXPENSE)
          .reduce((sum, t) => sum + t.amount, 0);

        accumulated = totalIncome - totalExpenses;
        break;
      }

      case GoalType.PURCHASE: {
        // Sum transactions from "Investimentos" category and its subcategories
        const userId = this.appContext.currentUserId;

        // Find the investment category (Investimentos) for the user
        const purchaseCategory = await this.categoriesService
          .getRepository()
          .createQueryBuilder('c')
          .innerJoin('c.user', 'u')
          .where('u.id = :userId', { userId })
          .andWhere('LOWER(c.name) LIKE :name', { name: '%compra%' })
          .getOne();

        if (!purchaseCategory) {
          // No investment category found, return 0
          accumulated = 0;
          break;
        }

        // Get all descendants (subcategories) using TypeORM tree repository
        const treeRepo = this.categoriesService
          .getRepository()
          .manager.getTreeRepository(Category);
        const categoryTree =
          await treeRepo.findDescendantsTree(purchaseCategory);

        // Collect all category IDs (parent + children)
        const collectIds = (cat: Category): number[] => {
          const ids = [cat.id];
          if (cat.children && cat.children.length > 0) {
            cat.children.forEach((child) => ids.push(...collectIds(child)));
          }
          return ids;
        };
        const categoryIds = collectIds(categoryTree);

        // Sum transactions from these categories
        accumulated = transactions
          .filter((t) => t.category && categoryIds.includes(t.category.id))
          .reduce((sum, t) => sum + t.amount, 0);
        break;
      }

      case GoalType.BUDGET:
        // For budget goals, accumulated is expenses (target is the limit)
        accumulated = transactions
          .filter((t) => t.category && t.category.type === CategoryType.EXPENSE)
          .reduce((sum, t) => sum + t.amount, 0);
        break;

      default:
        accumulated = 0;
    }

    return accumulated;
  }

  public calculateStatus(
    goal: Goal,
    accumulatedValue: number,
    today: Date,
  ): GoalStatus {
    if (today.getTime() < goal.startDate.getTime()) {
      return GoalStatus.NOT_STARTED;
    }

    if (today.getTime() <= goal.endDate.getTime()) {
      return GoalStatus.IN_PROGRESS;
    }

    switch (goal.type) {
      case GoalType.SAVINGS:
        // If accumulated > target => success; else failed
        return accumulatedValue > goal.targetValue
          ? GoalStatus.COMPLETED
          : GoalStatus.FAILED;

      case GoalType.DEBT:
        // If net (income-expense) > target => surplus; else deficit
        return accumulatedValue > goal.targetValue
          ? GoalStatus.SURPLUS
          : GoalStatus.DEFICIT;

      case GoalType.PURCHASE:
        // If accumulated > target => overspent; else success
        return accumulatedValue > goal.targetValue
          ? GoalStatus.OVER_BUDGET
          : GoalStatus.COMPLETED;

      case GoalType.BUDGET:
        // Expenses vs limit: if over limit => over budget; else within budget
        return accumulatedValue > goal.targetValue
          ? GoalStatus.OVER_BUDGET
          : GoalStatus.WITHIN_BUDGET;

      case GoalType.INVESTMENT:
        // If accumulated > target => success; else failed
        return accumulatedValue > goal.targetValue
          ? GoalStatus.COMPLETED
          : GoalStatus.FAILED;

      default:
        // Generic fallback
        return accumulatedValue >= goal.targetValue
          ? GoalStatus.COMPLETED
          : GoalStatus.IN_PROGRESS;
    }
  }
}
