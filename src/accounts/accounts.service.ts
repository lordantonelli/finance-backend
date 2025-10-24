import { Injectable } from '@nestjs/common';
import { BaseService } from '@shared/services/base.service';
import { Account } from './entities/account.entity';
import { AppContextService } from '@shared/services/app-context.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountHasTransactionsException } from '@exceptions/account-has-transactions.exception';

@Injectable()
export class AccountsService extends BaseService<Account> {
  constructor(
    @InjectRepository(Account)
    protected readonly repository: Repository<Account>,
    protected appContext: AppContextService,
  ) {
    super(repository, appContext);
  }

  async update(id: number, updateDto: Partial<Account>): Promise<Account> {
    const account = await this.repository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    if (account && account.transactions && account.transactions.length > 0) {
      delete updateDto.initialBalance;
    }

    return super.update(id, updateDto);
  }

  async remove(id: number): Promise<void> {
    const account = await this.repository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    if (account && account.transactions && account.transactions.length > 0) {
      throw new AccountHasTransactionsException();
    }

    await super.remove(id);
  }

  async updateBalance(
    idOrAccount: number | Account,
    amount: number,
  ): Promise<Account> {
    const account =
      typeof idOrAccount === 'number'
        ? await this.findOne(idOrAccount)
        : idOrAccount;
    account.currentBalance += amount;
    return this.repository.save(account);
  }
}
