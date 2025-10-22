import { CurrentUser } from './../decorators/current-user.decorator';
import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { User } from 'src/auth/users/entities/user.entity';
interface AppContextData {
  user?: any;
  executionContext?: any;
  metadata?: Map<string, any>;
}

@Injectable()
export class AppContextService {
  private contextData: AppContextData = {
    metadata: new Map(),
  };

  setExecutionContext(context: any) {
    this.contextData.executionContext = context;
  }

  setMetadata(key: string, value: any) {
    this.contextData.metadata?.set(key, value);
  }

  getMetadata<T>(key: string): T | undefined {
    return this.contextData.metadata?.get(key);
  }

  set currentUser(user: User) {
    this.contextData.user = user;
  }

  get currentUser(): User {
    return this.contextData.user;
  }

  get currentUserId(): number {
    return this.currentUser?.id;
  }

  get executionContext(): any {
    return this.contextData.executionContext;
  }
}
