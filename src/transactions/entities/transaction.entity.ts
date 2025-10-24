import { BaseEntity } from '@shared/entities/base.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, TableInheritance } from 'typeorm';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
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
}
