import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  Query,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginatedResponse, FilterByOwner } from '@shared/decorators';
import { FindManyOptions, ILike } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { isDefined, isNotEmpty } from 'class-validator';
import { QueryTypeListDto } from './dto/query-type-list.dto';

@ApiTags('Goals')
@ApiBearerAuth('access-token')
@Controller('goals')
@FilterByOwner()
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @ApiCreatedResponse({ type: Goal })
  @Post()
  create(@Body() createGoalDto: CreateGoalDto) {
    return this.goalsService.create(createGoalDto);
  }

  @ApiPaginatedResponse(Goal)
  @Get()
  findAll(@Query() query: QueryTypeListDto) {
    return this.goalsService.findAll(query, this.searchCondition);
  }

  @ApiOkResponse({ type: Goal })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.findOne(id);
  }

  @ApiOkResponse({ type: Goal })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalsService.update(id, updateGoalDto);
  }

  @ApiNoContentResponse({ description: 'No content' })
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.remove(id);
  }

  private searchCondition = (
    search: string,
    query: QueryTypeListDto,
  ): FindManyOptions<Goal> => {
    const where = {};
    if (isNotEmpty(search)) where['description'] = ILike(`%${search}%`);

    if (isDefined(query.type)) where['type'] = query.type;

    return { where };
  };
}
