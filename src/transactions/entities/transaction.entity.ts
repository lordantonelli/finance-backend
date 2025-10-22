import { BaseEntity } from '@shared/entities/base.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Column, ManyToOne } from 'typeorm/browser';

export class Transaction extends BaseEntity {
  @ManyToOne(() => Account, (account) => account.transactions)
  account: Account;

  @Column()
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  description: string;

  @ManyToOne(() => Category, { eager: true })
  category: Category;
}
