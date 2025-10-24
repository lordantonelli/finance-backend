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
import { isArray, isEmpty, isNotEmptyObject, isObject } from 'class-validator';

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
    optionsFn: (search: string, query: QueryListDto) => FindManyOptions<Entity>,
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

    const q = query as unknown as Record<string, unknown>;

    // Try different naming conventions
    const rawField =
      (q['orderField'] as string) ||
      (q['sortField'] as string) ||
      (q['orderBy'] as string) ||
      (q['sortBy'] as string) ||
      undefined;

    const rawDirection =
      (q['orderDirection'] as string) ||
      (q['sortDirection'] as string) ||
      (q['direction'] as string) ||
      (q['order'] as string) ||
      undefined;

    let field = defaultField;
    let direction: 'ASC' | 'DESC' = defaultDirection;
    let found = false;

    // Case 1: standalone sort string e.g., "-date" or "+name" or "date"
    const sort = (q['sort'] as string) || (q['order'] as string);
    if (typeof sort === 'string' && sort.trim().length > 0) {
      const trimmed = sort.trim();
      if (trimmed.startsWith('-')) direction = 'DESC';
      else direction = 'ASC';
      const key = trimmed.replace(/^[-+]/, '');
      if (key) field = key;
      found = true;
    }

    // Case 2: explicit field + direction
    if (rawField && typeof rawField === 'string') {
      field = rawField;
      found = true;
    }
    if (rawDirection && typeof rawDirection === 'string') {
      const dir = rawDirection.toUpperCase();
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
    const where = { [this.primaryColumnName]: id } as FindOptionsWhere<Entity>;
    const record = await this.repository.findOne({ where, relations });
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
