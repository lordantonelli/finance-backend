import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AccountsModule } from 'src/accounts/accounts.module';
import { GoalsModule } from 'src/goals/goals.module';

@Module({
  imports: [SharedModule, AccountsModule, TransactionsModule, GoalsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
