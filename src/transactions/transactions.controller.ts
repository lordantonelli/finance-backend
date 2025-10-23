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
} from '@nestjs/swagger';
import { Transaction } from './entities/transaction.entity';
import { ApiPaginatedResponse } from '@shared/decorators';
import {
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { isDefined, isNotEmpty } from 'class-validator';
import { TransactionQueryListDto } from './dto/transaction-query-list.dto';

@ApiTags('Accounts')
@ApiBearerAuth('access-token')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiCreatedResponse({ type: Transaction })
  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @ApiPaginatedResponse(Transaction)
  @Get()
  findAll(@Query() query: TransactionQueryListDto) {
    return this.transactionsService.findAll(query, this.searchCondition);
  }

  @ApiOkResponse({ type: Transaction })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }

  @ApiOkResponse({ type: Transaction })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @ApiNoContentResponse({ description: 'No content' })
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.remove(id);
  }

  private searchCondition = (
    search: string,
    query: TransactionQueryListDto,
  ): FindOptionsWhere<Transaction>[] => {
    const condition = {};
    if (isNotEmpty(search)) condition['name'] = ILike(`%${search}%`);

    if (isDefined(query.category) || isDefined(query.type)) {
      const categoryCondition = {};
      if (isDefined(query.category)) categoryCondition['id'] = query.category;
      if (isDefined(query.type)) categoryCondition['type'] = query.type;
      condition['category'] = categoryCondition;
    }

    if (isDefined(query.account)) condition['account'] = { id: query.account };

    if (isDefined(query.initialDate))
      condition['date'] = MoreThanOrEqual(query.initialDate);

    if (isDefined(query.finalDate))
      condition['date'] = LessThanOrEqual(query.finalDate);

    return [condition];
  };
}
