import { BaseEntity } from '@shared/entities/base.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { Category } from 'src/categories/entities/category.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, ManyToOne } from 'typeorm';

export class Transaction extends BaseEntity {
  @ApiProperty({
    description: 'The account associated with the transaction',
    type: () => Account,
  })
  @ManyToOne(() => Account, (account) => account.transactions)
  account: Account;

  @ApiProperty({ description: 'The amount of the transaction', example: 100.5 })
  @Column()
  amount: number;

  @ApiProperty({
    description: 'The date of the transaction',
    example: '2024-01-01',
  })
  @Column({ type: 'date' })
  date: Date;

  @ApiProperty({
    description: 'A brief description of the transaction',
    example: 'Grocery shopping at SuperMart',
  })
  @Column()
  description: string;

  @ApiProperty({
    description: 'The category associated with the transaction',
    type: () => Category,
  })
  @ManyToOne(() => Category, { eager: true })
  category: Category;
}
