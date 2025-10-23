import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { BaseService } from '@shared/services/base.service';
import { AppContextService } from '@shared/services/app-context.service';
import { Repository } from 'typeorm';
import { DefaultCategoryCannotBeModified } from '@exceptions/default-category-cannot-be-modified.exception';
import { CategoryHasTransactionsException } from '@exceptions/category-has-transactions.exception';
import { User } from 'src/auth/users/entities/user.entity';
import { CategoryType } from './entities/category-type.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { QueryListDto } from '@shared/dto/query-list.dto';

@Injectable()
export class CategoriesService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    protected readonly repository: Repository<Category>,
    protected appContext: AppContextService,
    private readonly transactionsService: TransactionsService,
  ) {
    super(repository, appContext);
  }

  async update(id: number, updateDto: Partial<Category>): Promise<Category> {
    const record = await this.findOne(id);
    if (record.isDefault) {
      throw new DefaultCategoryCannotBeModified();
    }
    await this.repository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    // Verifica se a categoria é padrão
    if (category.isDefault) {
      throw new DefaultCategoryCannotBeModified();
    }

    // Verifica se há transações associadas à categoria
    const transactions = await this.transactionsService.findAll(
      { page: 1, limit: 1 } as QueryListDto,
      () => [{ category: { id } }],
    );

    if (transactions.meta.itemCount > 0) {
      throw new CategoryHasTransactionsException();
    }

    await this.repository.delete(id);
  }

  async createDefaults(user: User): Promise<void> {
    const defaultCategories = [
      // Categorias de Receita
      { name: 'Salário', type: CategoryType.INCOME, user, isDefault: true },
      { name: 'Freelance', type: CategoryType.INCOME, user, isDefault: true },
      {
        name: 'Investimentos',
        type: CategoryType.INCOME,
        user,
        isDefault: true,
      },
      { name: 'Outras', type: CategoryType.INCOME, user, isDefault: true },
      // Categorias de Despesa
      {
        name: 'Alimentação',
        type: CategoryType.EXPENSE,
        user,
        isDefault: true,
      },
      { name: 'Transporte', type: CategoryType.EXPENSE, user, isDefault: true },
      { name: 'Moradia', type: CategoryType.EXPENSE, user, isDefault: true },
      { name: 'Saúde', type: CategoryType.EXPENSE, user, isDefault: true },
      { name: 'Educação', type: CategoryType.EXPENSE, user, isDefault: true },
      { name: 'Lazer', type: CategoryType.EXPENSE, user, isDefault: true },
      { name: 'Compras', type: CategoryType.EXPENSE, user, isDefault: true },
      { name: 'Serviços', type: CategoryType.EXPENSE, user, isDefault: true },
      { name: 'Outras', type: CategoryType.EXPENSE, user, isDefault: true },
    ];

    const categories = this.repository.create(defaultCategories);
    await this.repository.save(categories);
  }
}
