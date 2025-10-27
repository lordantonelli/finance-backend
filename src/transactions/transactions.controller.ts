import {
  Controller,
  forwardRef,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@shared/decorators';
import {
  FindManyOptions,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { isDefined, isNotEmpty } from 'class-validator';
import { StandardTransactionQueryListDto } from './dto/standard-transaction-query-list.dto';
import { TransactionsService } from './transactions.service';
import { TransactionQueryListDto } from './dto/transaction-query-list.dto';
import { Transaction } from './entities/transaction.entity';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
export class TransactionsController {
  constructor(
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
  ) {}

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

  private searchCondition = (
    search: string,
    query: TransactionQueryListDto,
  ): FindManyOptions<any> => {
    const where = {};
    if (isNotEmpty(search)) where['name'] = ILike(`%${search}%`);

    if (isDefined(query.account)) where['account'] = { id: query.account };

    if (isDefined(query.startDate))
      where['date'] = MoreThanOrEqual(query.startDate);

    if (isDefined(query.endDate))
      where['date'] = LessThanOrEqual(query.endDate);

    return { where };
  };
}
