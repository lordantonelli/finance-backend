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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
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
import { TransactionQueryListDto } from './dto/transaction-query-list.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { TransferTransaction } from './entities/transfer-transaction.entity';
import { TransferTransactionsService } from './transfer-transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions/transfer')
export class TransferTransactionsController {
  constructor(
    private readonly transactionsService: TransferTransactionsService,
  ) {}

  @ApiOperation({
    summary: 'Create a transfer between accounts',
    description:
      'Creates a transfer transaction moving funds from one account to another. Both accounts must belong to the authenticated user.',
  })
  @ApiCreatedResponse({
    description: 'Transfer created successfully',
    type: TransferTransaction,
  })
  @Post()
  create(@Body() createTransferDto: CreateTransferDto) {
    return this.transactionsService.create(createTransferDto);
  }

  @ApiOperation({ summary: 'Update a transfer between accounts' })
  @ApiOkResponse({
    description: 'Transfer updated successfully',
    type: TransferTransaction,
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransferDto: UpdateTransferDto,
  ) {
    return this.transactionsService.update(id, updateTransferDto);
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

  @ApiOperation({ summary: 'Delete a transfer between accounts' })
  @ApiNoContentResponse({ description: 'No content' })
  @Delete(':id')
  @HttpCode(204)
  removeTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.remove(id);
  }

  private searchCondition = (
    search: string,
    query: TransactionQueryListDto,
  ): FindManyOptions<Transaction> => {
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
