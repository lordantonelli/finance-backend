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

  @ApiCreatedResponse({ type: Category })
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @ApiPaginatedResponse(Category)
  @Get()
  findAll(@Query() query: QueryTypeListDto) {
    return this.categoriesService.findAll(query, this.searchCondition);
  }

  @ApiOkResponse({ type: Category })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @ApiOkResponse({ type: Category })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

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
