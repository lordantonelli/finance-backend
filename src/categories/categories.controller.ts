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
import { ApiPaginatedResponse, IsPublic } from '@shared/decorators';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryListDto } from '@shared/dto/query-list.dto';
import { Category } from './entities/category.entity';
import { CategoryType } from './entities/category-type.enum';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiCreatedResponse({ type: Category })
  @IsPublic()
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @ApiPaginatedResponse(Category)
  @Get()
  findAll(@Query() query: QueryListDto) {
    return this.categoriesService.findAll(query);
  }

  @ApiPaginatedResponse(Category)
  @Get('income')
  findIncomeAll(@Query() query: QueryListDto) {
    return this.categoriesService.findAll(query, [
      { type: CategoryType.INCOME },
    ]);
  }

  @ApiPaginatedResponse(Category)
  @Get('expense')
  findExpenseAll(@Query() query: QueryListDto) {
    return this.categoriesService.findAll(query, [
      { type: CategoryType.EXPENSE },
    ]);
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
}
