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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { Transaction } from './entities/transaction.entity';
import { ApiPaginatedResponse } from '@shared/decorators';
import {
  FindManyOptions,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { isDefined, isNotEmpty } from 'class-validator';
import { StandardTransactionQueryListDto } from './dto/standard-transaction-query-list.dto';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({
    summary: 'Create transaction',
    description: 'Creates a new income or expense transaction.',
  })
  @ApiCreatedResponse({ type: Transaction })
  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @ApiOperation({
    summary: 'List transactions',
    description:
      'Returns transactions (income/expense) for the authenticated user with pagination and optional filters.',
  })
  @ApiPaginatedResponse(Transaction)
  @Get()
  findAll(@Query() query: StandardTransactionQueryListDto) {
    return this.transactionsService.findAll(query, this.searchCondition);
  }

  @ApiOperation({
    summary: 'Get transaction',
    description:
      'Retrieves a specific transaction by ID (must belong to the authenticated user).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID' })
  @ApiOkResponse({ type: Transaction })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update transaction',
    description: 'Updates a transaction for the authenticated user.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID' })
  @ApiOkResponse({ type: Transaction })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @ApiOperation({
    summary: 'Delete transaction',
    description:
      'Deletes a transaction (income/expense) for the authenticated user.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID' })
  @ApiNoContentResponse({ description: 'No content' })
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.remove(id);
  }

  private searchCondition = (
    search: string,
    query: StandardTransactionQueryListDto,
  ): FindManyOptions<Transaction> => {
    const where = {};
    if (isNotEmpty(search)) where['name'] = ILike(`%${search}%`);

    if (isDefined(query.category) || isDefined(query.type)) {
      const categoryCondition = {};
      if (isDefined(query.category)) categoryCondition['id'] = query.category;
      if (isDefined(query.type)) categoryCondition['type'] = query.type;
      where['category'] = categoryCondition;
    }

    if (isDefined(query.account)) where['account'] = { id: query.account };

    if (isDefined(query.startDate))
      where['date'] = MoreThanOrEqual(query.startDate);

    if (isDefined(query.endDate))
      where['date'] = LessThanOrEqual(query.endDate);

    return { where };
  };
}
