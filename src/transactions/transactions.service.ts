/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { BaseService } from '@shared/services/base.service';
import { AppContextService } from '@shared/services/app-context.service';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService extends BaseService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    protected readonly repository: Repository<Transaction>,
    protected appContext: AppContextService,
  ) {
    super(repository, appContext);
  }

  create(createDto: DeepPartial<Transaction>): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }

  update(id: number, updateDto: Transaction): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }

  remove(id: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
