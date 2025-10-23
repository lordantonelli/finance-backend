import {
  Repository,
  FindOptionsWhere,
  ObjectLiteral,
  DeepPartial,
} from 'typeorm';
import { RecordNotFoundException } from 'src/exceptions/record-not-found.exception';
import { Pagination } from 'nestjs-typeorm-paginate';
import { RepositoryUtils } from '../utils/repository.utils';
import { QueryListDto } from '../dto/query-list.dto';
import { User } from 'src/auth/users/entities/user.entity';
import { ForbiddenException } from '@nestjs/common';
import { AppContextService } from './app-context.service';

export abstract class BaseService<Entity extends ObjectLiteral> {
  private readonly primaryColumnName: string;

  constructor(
    protected readonly repository: Repository<Entity>,
    protected appContext: AppContextService,
  ) {
    console.log(this.repository);

    const primaryColumns = this.repository.metadata.primaryColumns;
    if (primaryColumns.length === 0) {
      throw new Error('Entity does not have a primary column defined');
    }
    this.primaryColumnName = primaryColumns[0].propertyName;
  }

  protected get currentUser(): User | null {
    return this.appContext.currentUser || null;
  }

  protected get currentUserId(): number {
    return this.appContext.currentUserId;
  }

  protected isOwner(resource: Entity, ownerField: string = 'user'): boolean {
    return resource[ownerField] === this.currentUserId;
  }

  protected isOwnerFilterEnabled(): boolean {
    return this.appContext.getMetadata<boolean>('ownerFilterEnabled') || false;
  }

  async create(createDto: DeepPartial<Entity>): Promise<Entity> {
    const record = this.repository.create(createDto);
    return await this.repository.save(record);
  }

  async findAll(
    query: QueryListDto,
    conditions: (
      search: string,
      query: QueryListDto,
    ) => FindOptionsWhere<Entity>[],
  ): Promise<Pagination<Entity>> {
    const where = conditions(query.search, query);
    if (this.isOwnerFilterEnabled()) {
      if (where.length === 0) {
        where.push({ user: { id: this.currentUserId } } as any);
      } else {
        where.forEach((condition) => {
          (condition as Record<string, any>).user = { id: this.currentUserId };
        });
      }
    }
    return RepositoryUtils.findAllWithPagination(this.repository, query, where);
  }

  async findOne(id: number): Promise<Entity> {
    const where = { [this.primaryColumnName]: id } as FindOptionsWhere<Entity>;
    const record = await this.repository.findOne({ where });
    if (!record) throw new RecordNotFoundException();
    if (this.isOwnerFilterEnabled() && !this.isOwner(record)) {
      throw new ForbiddenException('You do not have access to this resource');
    }
    return record;
  }

  async update(id: number, updateDto: Partial<Entity>): Promise<Entity> {
    await this.findOne(id);
    await this.repository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }
}
