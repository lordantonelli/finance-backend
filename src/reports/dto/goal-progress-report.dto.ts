import { ApiProperty } from '@nestjs/swagger';
import { GoalStatus } from '../../goals/entities/goal-status.enum';
import { Goal } from 'src/goals/entities/goal.entity';

export class GoalProgressReportDto {
  @ApiProperty({ description: 'Goal details', type: () => Goal })
  goal: Goal;

  @ApiProperty({
    description: 'Accumulated value towards the goal',
    example: 3200,
  })
  accumulatedValue: number;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 64,
  })
  progressPercentage: number;

  @ApiProperty({ description: 'Current status of the goal', enum: GoalStatus })
  status: GoalStatus;

  @ApiProperty({
    description: 'Amount remaining to reach the goal',
    example: 1800,
  })
  remainingValue: number;
}
