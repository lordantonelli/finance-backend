/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { IsUniqueConstraint } from './validators/is-unique.constraint';
import { ExistsConstraint } from './validators/exists.constraint';
import { AppContextService } from './services/app-context.service';

@Module({
  imports: [],
  controllers: [],
  providers: [IsUniqueConstraint, ExistsConstraint, AppContextService],
  exports: [IsUniqueConstraint, ExistsConstraint, AppContextService],
})
export class SharedModule {}
