import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@shared/shared.module';
import { Transaction } from './entities/transaction.entity';
import { StandardTransaction } from './entities/standard-transaction.entity';
import { TransferTransaction } from './entities/transfer-transaction.entity';
import { AccountsModule } from 'src/accounts/accounts.module';
import { StandardTransactionsService } from './standard-transactions.service';
import { StandardTransactionsController } from './standard-transactions.controller';
import { TransferTransactionsService } from './transfer-transactions.service';
import { TransferTransactionsController } from './transfer-transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      StandardTransaction,
      TransferTransaction,
    ]),
    SharedModule,
    forwardRef(() => AccountsModule),
  ],
  controllers: [
    TransactionsController,
    TransferTransactionsController,
    StandardTransactionsController,
  ],
  providers: [
    TransactionsService,
    StandardTransactionsService,
    TransferTransactionsService,
  ],
  exports: [
    TransactionsService,
    StandardTransactionsService,
    TransferTransactionsService,
  ],
})
export class TransactionsModule {}
