import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { DeepPartial, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RecordNotFoundException } from '@exceptions';
import { CategoriesService } from 'src/categories/categories.service';
import { hashSync } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) protected readonly repository: Repository<User>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createDto: DeepPartial<User>): Promise<User> {
    const record = this.repository.create(createDto);
    const user = await this.repository.save(record);
    delete user.password; // Remove password from the response

    // Criar categorias padrão para o novo usuário
    await this.categoriesService.createDefaults(user);

    return user;
  }

  getSearchCondition(search: string | undefined): FindOptionsWhere<User>[] {
    const where: FindOptionsWhere<User>[] = [];
    if (search) {
      const ilike = ILike(`%${search}%`);
      where.push({ name: ilike });
    }
    return where;
  }

  async findOne(id: number): Promise<User> {
    const record = await this.repository.findOne({ where: { id } });
    if (!record) throw new RecordNotFoundException();
    return record;
  }

  async update(id: number, updateDto: DeepPartial<User>): Promise<User> {
    const user = await this.findOne(id);

    // If password is being updated, hash it
    if (updateDto.password) {
      updateDto.password = hashSync(updateDto.password, 10);
    }

    // Merge the updates into the user entity
    this.repository.merge(user, updateDto);

    // Save the updated user
    const updatedUser = await this.repository.save(user);

    // Remove password from the response
    delete updatedUser.password;

    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.repository.remove(user);
  }

  async findByEmail(
    email: string,
    includePassowrd: boolean = false,
  ): Promise<User | null> {
    const user = await this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email and user.isactive = true', { email })
      .getOne();

    if (user && !includePassowrd) {
      delete user?.password; // Remove password from the response
    }

    return user;
  }
}
