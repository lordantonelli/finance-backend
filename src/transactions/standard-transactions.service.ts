import { Injectable } from '@nestjs/common';
import { BaseService } from '@shared/services/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AppContextService } from '@shared/services/app-context.service';
import { CategoryType } from 'src/categories/entities/category-type.enum';
import { AccountsService } from '../accounts/accounts.service';
import { StandardTransaction } from './entities/standard-transaction.entity';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class StandardTransactionsService extends BaseService<StandardTransaction> {
  constructor(
    @InjectRepository(StandardTransaction)
    protected readonly repository: Repository<StandardTransaction>,
    protected appContext: AppContextService,
    protected readonly accountsService: AccountsService,
  ) {
    super(repository, appContext);
  }

  async create(
    createDto: DeepPartial<StandardTransaction>,
  ): Promise<StandardTransaction> {
    // Create the transaction
    const record = this.repository.create(createDto);
    const transaction = await this.repository.save(record);

    // Load full transaction with relations to get category type
    const fullTransaction = await this.findOne(transaction.id, [
      'account',
      'category',
    ]);

    // Update account current balance
    await this.accountsService.updateBalance(
      fullTransaction.account,
      (fullTransaction.category?.type === CategoryType.INCOME ? 1 : -1) *
        fullTransaction.amount,
    );

    return transaction;
  }

  async update(
    id: number,
    updateDto: UpdateTransactionDto,
  ): Promise<StandardTransaction> {
    // Load the original transaction with relations
    const original = await this.findOne(id, ['account', 'category']);

    // Compute original effect before applying changes
    const signOld = original.category?.type === CategoryType.INCOME ? 1 : -1;
    const effectOld = signOld * (original.amount ?? 0);

    // Persist and Reload updated with relations to know the final state
    const current = await super.update(id, updateDto);

    // Compute balance adjustments
    const signNew = current.category?.type === CategoryType.INCOME ? 1 : -1;
    const effectNew = signNew * (current.amount ?? 0);

    if (original.account?.id === current.account?.id) {
      const delta = effectNew - effectOld;
      if (delta !== 0) {
        await this.accountsService.updateBalance(current.account, delta);
      }
    } else {
      // Revert effect on old account
      await this.accountsService.updateBalance(original.account, -effectOld);
      // Apply effect on new account
      await this.accountsService.updateBalance(current.account, effectNew);
    }

    return current;
  }

  async remove(id: number): Promise<void> {
    const transaction = await this.findOne(id, ['account', 'category']);
    const sign = transaction.category?.type === CategoryType.INCOME ? 1 : -1;
    const effect = sign * transaction.amount;
    await this.accountsService.updateBalance(transaction.account, -effect);
    return await super.remove(id);
  }
}
