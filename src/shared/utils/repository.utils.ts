import { Repository, ObjectLiteral, FindManyOptions } from 'typeorm';
import {
  createPaginationObject,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { QueryListDto } from '../dto/query-list.dto';

export class RepositoryUtils {
  static async findAllWithPagination<T extends ObjectLiteral>(
    repository: Repository<T>,
    query: QueryListDto,
    options: FindManyOptions<T> = {},
  ): Promise<Pagination<T>> {
    if (query.limit === 0) {
      const items = await repository.find(options);
      return createPaginationObject({
        items,
        totalItems: items.length,
        currentPage: 1,
        limit: items.length,
      });
    }

    return paginate<T>(repository, query, options);
  }
}
