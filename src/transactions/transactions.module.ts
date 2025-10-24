import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { SharedModule } from '@shared/shared.module';
import { AccountsModule } from 'src/accounts/accounts.module';
import { StandardTransaction } from './entities/standard-transaction.entity';
import { TransferTransaction } from './entities/transfer-transaction.entity';
import { TransferTransactionsController } from './transfer-transactions.controller';
import { TransferTransactionsService } from './transfer-transactions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      StandardTransaction,
      TransferTransaction,
    ]),
    SharedModule,
    AccountsModule,
  ],
  controllers: [TransferTransactionsController, TransactionsController],
  providers: [TransferTransactionsService, TransactionsService],
  exports: [TransferTransactionsService, TransactionsService],
})
export class TransactionsModule {}
