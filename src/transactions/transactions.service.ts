import { Injectable } from '@nestjs/common';
import { BaseService } from '@shared/services/base.service';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppContextService } from '@shared/services/app-context.service';

@Injectable()
export class TransactionsService extends BaseService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    protected readonly repository: Repository<Transaction>,
    protected appContext: AppContextService,
  ) {
    super(repository, appContext);
  }
}
