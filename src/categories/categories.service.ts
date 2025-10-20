import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { BaseService } from '@shared/services/base.service';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { QueryListDto } from '@shared/dto/query-list.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { RepositoryUtils } from '@shared/utils/repository.utils';

@Injectable()
export class CategoriesService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    protected readonly repository: Repository<Category>,
  ) {
    super(repository);
  }

  getSearchCondition(
    search: string | undefined,
    where: FindOptionsWhere<Category>[] = [],
  ): FindOptionsWhere<Category>[] {
    if (search) {
      const ilike = ILike(`%${search}%`);
      where.push({ name: ilike });
    }
    return where;
  }
}
