import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), SharedModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
