import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { UserBaseEntity } from '@shared/entities/user-base.entity';
import { GoalType } from 'src/goals/entities/goal-type.enum';

@Entity()
export class Goal extends UserBaseEntity {
  @ApiProperty({
    description:
      'Type of the goal:' +
      'POUPANCA (accumulated balance = previous balance + income - expenses), ' +
      'INVESTIMENTO (sum of transactions in "Investimentos" category and subcategories), ' +
      'DIVIDA (net balance of period = income - expenses), ' +
      'COMPRA (sum of transactions in "Compras" category and subcategories), ' +
      'ORCAMENTO (total expenses in period)',
    enum: GoalType,
  })
  @Column()
  type: GoalType;

  @ApiProperty({ description: 'Target value to reach', example: 5000 })
  @Column('float')
  targetValue: number;

  @ApiProperty({ description: 'Goal start date', example: '2025-01-01' })
  @Column({
    type: 'date',
    transformer: {
      to: (value: Date) => value,
      from: (value: string) => new Date(value),
    },
  })
  startDate: Date;

  @ApiProperty({ description: 'Goal end date', example: '2025-12-31' })
  @Column({
    type: 'date',
    transformer: {
      to: (value: Date) => value,
      from: (value: string) => new Date(value),
    },
  })
  endDate: Date;

  @ApiPropertyOptional({ description: 'Goal description' })
  @Column({ nullable: true })
  description?: string;
}
