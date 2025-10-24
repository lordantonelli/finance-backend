import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Category } from '../entities/category.entity';
import { ExistsAndBelongsToUser, IsUnique } from '@shared/decorators';
import { Type } from 'class-transformer';
import { RelationEntityDto } from '@shared/dto/relation-entity.dto';
import { CategoryType } from '../entities/category-type.enum';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Name of the category' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  @IsUnique(Category, ['name', 'type', 'user', 'parent'])
  name: string;

  @ApiProperty({ description: 'Icon of the category' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'Type of the category', enum: CategoryType })
  @IsEnum(CategoryType)
  @IsDefined()
  type: CategoryType;

  @ApiProperty({
    description: 'Parent category',
    type: RelationEntityDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => RelationEntityDto)
  @IsObject()
  @IsOptional()
  @ExistsAndBelongsToUser(Category)
  parent?: Category;
}
