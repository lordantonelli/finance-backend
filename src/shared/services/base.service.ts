/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Repository,
  FindOptionsWhere,
  ObjectLiteral,
  DeepPartial,
  FindManyOptions,
} from 'typeorm';
import { RecordNotFoundException } from 'src/exceptions/record-not-found.exception';
import { Pagination } from 'nestjs-typeorm-paginate';
import { RepositoryUtils } from '../utils/repository.utils';
import { QueryListDto } from '../dto/query-list.dto';
import { User } from 'src/auth/users/entities/user.entity';
import { ForbiddenException } from '@nestjs/common';
import { AppContextService } from './app-context.service';
import {
  isArray,
  isEmpty,
  isNotEmpty,
  isNotEmptyObject,
  isObject,
  isString,
} from 'class-validator';

export abstract class BaseService<Entity extends ObjectLiteral> {
  private readonly primaryColumnName: string;

  constructor(
    protected readonly repository: Repository<Entity>,
    protected appContext: AppContextService,
  ) {
    const primaryColumns = this.repository.metadata.primaryColumns;
    if (primaryColumns.length === 0) {
      throw new Error('Entity does not have a primary column defined');
    }
    this.primaryColumnName = primaryColumns[0].propertyName;
  }

  public getRepository(): Repository<Entity> {
    return this.repository;
  }

  protected get currentUser(): User | null {
    return this.appContext.currentUser || null;
  }

  protected get currentUserId(): number {
    return this.appContext.currentUserId;
  }

  protected isOwner(resource: Entity, ownerField: string = 'user'): boolean {
    const res = resource as unknown as Record<string, unknown>;
    const owner = res ? res[ownerField] : undefined;
    // Owner can be an object with id or a primitive id (number)
    if (!owner) return false;
    if (
      typeof owner === 'object' &&
      owner !== null &&
      Object.prototype.hasOwnProperty.call(
        owner as Record<string, unknown>,
        'id',
      )
    ) {
      return (owner as { id: number }).id === this.currentUserId;
    }
    if (typeof owner === 'number') {
      return owner === this.currentUserId;
    }
    return false;
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
    optionsFn: (
      search: string | undefined | null,
      query: QueryListDto,
    ) => FindManyOptions<Entity>,
  ): Promise<Pagination<Entity>> {
    // Generate base query options from the provided function
    const options = optionsFn(query.search, query);

    // Determine ordering from query params or fall back to defaults
    const {
      field: orderField,
      direction: orderDirection,
      found,
    } = this.getOrderFromQuery(query, {
      defaultField: this.primaryColumnName,
      defaultDirection: 'DESC',
    });

    // Apply ordering from query when present, otherwise keep given options or defaults
    if (found) {
      options.order = {
        [orderField]: orderDirection,
      } as FindManyOptions<Entity>['order'];
    } else if (!options.order) {
      options.order = {
        [orderField]: orderDirection,
      } as FindManyOptions<Entity>['order'];
    }

    // Apply owner filter if enabled for REQUEST-scoped services
    if (this.isOwnerFilterEnabled()) {
      this.applyOwnerFilter(options);
    }

    return RepositoryUtils.findAllWithPagination(
      this.repository,
      query,
      options,
    );
  }

  /**
   * Applies owner filter to query options based on current user
   * Handles different where clause structures (empty, object, or array)
   */
  private applyOwnerFilter(options: FindManyOptions<Entity>): void {
    const ownerCondition = { user: { id: this.currentUserId } };

    // Handle empty or non-existent where clause
    if (
      isEmpty(options.where) ||
      (isObject(options.where) && !isNotEmptyObject(options.where))
    ) {
      options.where = ownerCondition as any;
      return;
    }

    // Handle array of conditions
    if (isArray(options.where)) {
      if (options.where.length === 0) {
        options.where = [ownerCondition] as any;
      } else {
        // Add owner filter to each condition in the array
        options.where.forEach((condition) => {
          (condition as Record<string, any>).user = { id: this.currentUserId };
        });
      }
      return;
    }

    // Handle single object condition
    (options.where as Record<string, any>).user = {
      id: this.currentUserId,
    } as any;
  }

  /**
   * Extracts order information (field and direction) from a QueryList-like DTO.
   * It supports multiple common parameter conventions:
   * - orderField/orderDirection
   * - sortField/sortDirection
   * - orderBy/direction
   * - sort (e.g., "-date" means DESC by date, "+date" or "date" means ASC)
   * If not found, returns provided defaults.
   */
  protected getOrderFromQuery(
    query: QueryListDto,
    options?: {
      defaultField?: string;
      defaultDirection?: 'ASC' | 'DESC';
      allowedFields?: string[];
      map?: Record<string, string>; // map input field -> actual column
    },
  ): { field: string; direction: 'ASC' | 'DESC'; found: boolean } {
    const defaultField = options?.defaultField ?? this.primaryColumnName;
    const defaultDirection = options?.defaultDirection ?? 'DESC';

    let field = defaultField;
    let direction: 'ASC' | 'DESC' = defaultDirection;
    let found = false;

    if (isNotEmpty(query.orderBy) && isString(query.orderBy)) {
      field = query.orderBy;
      found = true;
    }
    if (isNotEmpty(query.order) && isString(query.order)) {
      const dir = query.order.toUpperCase();
      if (dir === 'ASC' || dir === 'DESC') direction = dir;
      found = true;
    }

    // Map/validate field if needed
    if (options?.map && field in options.map) field = options.map[field]!;
    if (options?.allowedFields && !options.allowedFields.includes(field)) {
      // If not allowed, fall back to defaults but indicate not found to avoid overriding service-defined order
      return { field: defaultField, direction: defaultDirection, found: false };
    }

    return { field, direction, found };
  }

  async findOne(id: number, relations: string[] = []): Promise<Entity> {
    const where = {
      [this.primaryColumnName]: id,
    } as FindOptionsWhere<Entity> & {
      user?: { id: number };
    };

    // Enforce ownership at query level when owner filter is enabled
    if (this.isOwnerFilterEnabled()) {
      relations.push('user');
      where.user = { id: this.currentUserId };
    }

    const record = await this.repository.findOne({ where, relations });
    if (!record) throw new RecordNotFoundException();

    // Extra safety: if owner filter is enabled but relation wasn't loaded, still verify if possible
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
