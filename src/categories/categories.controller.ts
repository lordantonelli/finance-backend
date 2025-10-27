import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { ApiPaginatedResponse, FilterByOwner } from '@shared/decorators';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { FindManyOptions, ILike } from 'typeorm';
import { isDefined, isNotEmpty } from 'class-validator';
import { QueryTypeListDto } from './dto/query-type-list.dto';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@Controller('categories')
@FilterByOwner()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({
    summary: 'Create category',
    description:
      'Creates a new transaction category for the authenticated user.',
  })
  @ApiCreatedResponse({ type: Category })
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @ApiOperation({
    summary: 'List categories',
    description:
      'Returns categories for the authenticated user with pagination and optional filters.',
  })
  @ApiPaginatedResponse(Category)
  @Get()
  findAll(@Query() query: QueryTypeListDto) {
    return this.categoriesService.findAll(query, this.searchCondition);
  }

  @ApiOperation({
    summary: 'Get category',
    description:
      'Retrieves a specific category by ID (must belong to the authenticated user).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiOkResponse({ type: Category })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update category',
    description: 'Updates a category for the authenticated user.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiOkResponse({ type: Category })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @ApiOperation({
    summary: 'Delete category',
    description: 'Deletes a category belonging to the authenticated user.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiNoContentResponse({ description: 'No content' })
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }

  private searchCondition = (
    search: string,
    query: QueryTypeListDto,
  ): FindManyOptions<Category> => {
    const where = {};
    if (isNotEmpty(search)) where['name'] = ILike(`%${search}%`);

    if (isDefined(query.active)) where['active'] = query.active;

    if (isDefined(query.type)) where['type'] = query.type;

    return { where };
  };
}
