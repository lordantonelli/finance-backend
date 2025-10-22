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
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Tree('closure-table')
@Unique(['name', 'type', 'user', 'parent'])
export class Category extends UserBaseEntity {
  @ApiProperty({ description: 'Name of the category' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Type of the category', enum: CategoryType })
  @Column()
  type: CategoryType;

  @ApiProperty({ description: 'Icon of the category', nullable: true })
  @Column({ nullable: true })
  icon: string;

  @TreeParent()
  parent: Category;

  @TreeChildren()
  children: Category[];

  @ApiProperty({ description: 'Indicates if the category is the default one' })
  @Column({ default: false })
  isDefault: boolean = false;

  @ApiProperty({ description: 'Indicates if the category is active' })
  @Column({ default: true })
  isActive: boolean = true;
}
