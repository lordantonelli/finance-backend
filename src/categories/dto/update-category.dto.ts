import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { IsBoolean, IsDefined } from 'class-validator';
import { Optional } from '@nestjs/common';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiProperty({
    required: false,
    type: Boolean,
    description: 'Is the category active?',
  })
  @IsDefined()
  @IsBoolean()
  @Optional()
  isActive?: boolean;
}
