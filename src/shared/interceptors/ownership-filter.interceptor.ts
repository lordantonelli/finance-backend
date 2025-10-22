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
export class OwnershipFilterInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private appContext: AppContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    // Pegar metadados do decorator
    const ownerField =
      this.reflector.getAllAndOverride<string>('ownerField', [
        context.getHandler(),
        context.getClass(),
      ]) || 'user';
    const filterEnabled = this.reflector.getAllAndOverride<boolean>(
      'filterByOwner',
      [context.getHandler(), context.getClass()],
    );

    this.appContext.setExecutionContext(context);
    this.appContext.currentUser = user;
    this.appContext.setMetadata('ownerField', ownerField);
    this.appContext.setMetadata('ownerFilterEnabled', filterEnabled || false);

    if (filterEnabled) {
      // Adicionar filtro automático na query ou body
      if (request.query) {
        request.query[ownerField] = user.id;
      }

      // Para métodos POST/PUT, adicionar no body
      if (
        request.body &&
        (request.method === 'POST' ||
          request.method === 'PUT' ||
          request.method === 'PATCH')
      ) {
        request.body[ownerField] = user;
      }
    }

    return next.handle();
  }
}
