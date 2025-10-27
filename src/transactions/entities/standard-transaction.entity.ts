import { ChildEntity, ManyToOne } from 'typeorm';
import { Transaction } from './transaction.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/categories/entities/category.entity';

@ChildEntity('Standard')
export class StandardTransaction extends Transaction {
  @ApiProperty({
    description: 'The category associated with the transaction',
    type: () => Category,
  })
  @ManyToOne(() => Category, { eager: true, nullable: true })
  category?: Category;
}
