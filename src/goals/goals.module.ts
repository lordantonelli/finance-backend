import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { Goal } from './entities/goal.entity';
import { SharedModule } from '@shared/shared.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { AccountsModule } from 'src/accounts/accounts.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Goal]),
    SharedModule,
    forwardRef(() => TransactionsModule),
    AccountsModule,
    CategoriesModule,
  ],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
