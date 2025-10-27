import { ChildEntity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';

@ChildEntity('Transfer')
export class TransferTransaction extends Transaction {
  @ApiProperty({
    description: 'The destination account for the transfer',
    type: () => Account,
  })
  @ManyToOne(() => Account, { nullable: true })
  toAccount: Account;

  @ApiProperty({
    description: 'The related transaction for the transfer',
    type: () => TransferTransaction,
  })
  @OneToOne(() => TransferTransaction, { nullable: true })
  @JoinColumn()
  relatedTransaction: TransferTransaction;
}
