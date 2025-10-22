import { BeforeInsert, Column, OneToMany } from 'typeorm';
import { UserBaseEntity } from '../../shared/entities/user-base.entity';
import { AccountType } from './account-type.enum';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { ApiProperty } from '@nestjs/swagger';
export class Account extends UserBaseEntity {
  @ApiProperty({ description: 'Name of the account' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Initial balance of the account' })
  @Column()
  initialBalance: number;

  @ApiProperty({
    description: 'Current balance of the account',
    readOnly: true,
  })
  @Column()
  currentBalance: number;

  @ApiProperty({ description: 'Type of the account', enum: AccountType })
  @Column()
  type: AccountType;

  @ApiProperty({
    description: 'Color of the account',
    example: '#FF5733',
    format: 'hex-color',
    type: 'string',
  })
  @Column()
  color: string;

  @ApiProperty({ description: 'Icon of the account', nullable: true })
  @Column({ nullable: true })
  icon: string;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];

  @ApiProperty({ description: 'Indicates if the account is active' })
  @Column({ default: true })
  isActive: boolean = true;

  @BeforeInsert()
  updateCurrentBalance() {
    this.currentBalance = this.initialBalance;
  }
}
