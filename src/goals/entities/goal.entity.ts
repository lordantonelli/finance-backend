import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { UserBaseEntity } from '@shared/entities/user-base.entity';
import { GoalType } from 'src/goals/entities/goal-type.enum';

@Entity()
export class Goal extends UserBaseEntity {
  @ApiProperty({ description: 'Type of the goal', enum: GoalType })
  @Column()
  type: GoalType;

  @ApiProperty({ description: 'Target value to reach', example: 5000 })
  @Column('float')
  targetValue: number;

  @ApiProperty({ description: 'Goal start date', example: '2025-01-01' })
  @Column({ type: 'date' })
  startDate: Date;

  @ApiProperty({ description: 'Goal end date', example: '2025-12-31' })
  @Column({ type: 'date' })
  endDate: Date;

  @ApiPropertyOptional({ description: 'Goal description' })
  @Column({ nullable: true })
  description?: string;
}
