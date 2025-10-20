import {
  Column,
  Entity,
  Tree,
  TreeChildren,
  TreeParent,
  Unique,
} from 'typeorm';
import { CategoryType } from './category-type.enum';
import { UserBaseEntity } from '@shared/entities/user-base.entity';

@Entity()
@Tree('closure-table')
@Unique(['name', 'type', 'user', 'parent'])
export class Category extends UserBaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  type: CategoryType;

  @Column({ nullable: true })
  icon: string;

  @TreeParent()
  parent: Category;

  @TreeChildren()
  children: Category[];

  @Column({ default: false })
  isDefault: boolean = false;

  @Column({ default: true })
  isActive: boolean = true;
}
