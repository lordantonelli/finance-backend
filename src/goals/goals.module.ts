import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { Goal } from './entities/goal.entity';
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Goal]), SharedModule],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
