import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { BaseService } from '@shared/services/base.service';
import { AppContextService } from '@shared/services/app-context.service';
import { Repository } from 'typeorm';
import { DefaultCategoryCannotBeModified } from '@exceptions/default-category-cannot-be-modified.exception';

@Injectable({ scope: Scope.REQUEST })
export class CategoriesService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    protected readonly repository: Repository<Category>,
    protected appContext: AppContextService,
  ) {
    super(repository, appContext);
  }

  async update(id: number, updateDto: Partial<Category>): Promise<Category> {
    const record = await this.findOne(id);
    if (record.isDefault) {
      throw new DefaultCategoryCannotBeModified();
    }
    return super.update(id, updateDto);
  }
}
