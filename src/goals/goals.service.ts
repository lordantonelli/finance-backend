import { Injectable } from '@nestjs/common';
import { BaseService } from '@shared/services/base.service';
import { Goal } from './entities/goal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppContextService } from '@shared/services/app-context.service';

@Injectable()
export class GoalsService extends BaseService<Goal> {
  constructor(
    @InjectRepository(Goal)
    protected readonly repository: Repository<Goal>,
    protected appContext: AppContextService,
  ) {
    super(repository, appContext);
  }
}
