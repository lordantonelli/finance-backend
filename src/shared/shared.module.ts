/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { IsUniqueConstraint } from './validators/is-unique.constraint';
import { ExistsConstraint } from './validators/exists.constraint';
import { ExistsAndBelongsToUserConstraint } from './validators/exists-and-belongs-to-user.constraint';
import { AppContextService } from './services/app-context.service';
import { StartBeforeOrEqualEndConstraint } from './validators/start-before-or-equal-end.constraint';
import { DifferentFieldConstraint } from './validators/different-field.constraint';

@Module({
  imports: [],
  controllers: [],
  providers: [
    IsUniqueConstraint,
    ExistsConstraint,
    ExistsAndBelongsToUserConstraint,
    StartBeforeOrEqualEndConstraint,
    DifferentFieldConstraint,
    AppContextService,
  ],
  exports: [
    IsUniqueConstraint,
    ExistsConstraint,
    ExistsAndBelongsToUserConstraint,
    StartBeforeOrEqualEndConstraint,
    DifferentFieldConstraint,
    AppContextService,
  ],
})
export class SharedModule {}
