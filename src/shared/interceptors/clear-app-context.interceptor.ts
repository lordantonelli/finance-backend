import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppContextService } from '@shared/services/app-context.service';
import { Observable } from 'rxjs';

@Injectable()
export class ClearAppContextInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private appContext: AppContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.appContext.setExecutionContext(context);
    this.appContext.setMetadata('ownerFilterEnabled', false);
    this.appContext.setMetadata('ownerField', null);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    this.appContext.currentUser = user;

    return next.handle();
  }
}
