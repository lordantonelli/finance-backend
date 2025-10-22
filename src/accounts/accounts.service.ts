import { Injectable, Scope } from '@nestjs/common';
import { BaseService } from '@shared/services/base.service';
import { Account } from './entities/account.entity';
import { AppContextService } from '@shared/services/app-context.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable({ scope: Scope.REQUEST })
export class AccountsService extends BaseService<Account> {
  constructor(
    @InjectRepository(Account)
    protected readonly repository: Repository<Account>,
    protected appContext: AppContextService,
  ) {
    super(repository, appContext);
  }
}
