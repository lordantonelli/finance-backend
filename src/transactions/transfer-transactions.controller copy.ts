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
import { TransferTransactionQueryListDto } from './dto/transfer-transaction-query-list.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { TransferTransaction } from './entities/transfer-transaction.entity';
import { TransferTransactionsService } from './transfer-transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions/transfer')
export class TransferTransactionsController {
  constructor(
    private readonly transferTransactionsService: TransferTransactionsService,
  ) {}

  @ApiOperation({
    summary: 'Create transfer',
    description:
      'Creates a transfer transaction moving funds from one account to another. Both accounts must belong to the authenticated user.',
  })
  @ApiCreatedResponse({
    description: 'Transfer created successfully',
    type: TransferTransaction,
  })
  @Post()
  create(@Body() createTransferDto: CreateTransferDto) {
    return this.transferTransactionsService.create(createTransferDto);
  }

  @ApiOperation({
    summary: 'Update transfer',
    description: 'Updates a transfer transaction between accounts.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Transfer ID' })
  @ApiOkResponse({
    description: 'Transfer updated successfully',
    type: TransferTransaction,
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransferDto: UpdateTransferDto,
  ) {
    return this.transferTransactionsService.update(id, updateTransferDto);
  }

  @ApiOperation({
    summary: 'List transfers',
    description:
      'Returns transfer transactions between accounts with pagination and optional filters.',
  })
  @ApiPaginatedResponse(Transaction)
  @Get()
  findAll(@Query() query: TransferTransactionQueryListDto) {
    return this.transferTransactionsService.findAll(
      query,
      this.searchCondition,
    );
  }

  @ApiOperation({
    summary: 'Get transfer',
    description: 'Retrieves a specific transfer transaction by ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Transfer ID' })
  @ApiOkResponse({ type: Transaction })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transferTransactionsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Delete transfer',
    description: 'Deletes a transfer transaction between accounts.',
  })
  @ApiNoContentResponse({ description: 'No content' })
  @ApiParam({ name: 'id', type: Number, description: 'Transfer ID' })
  @Delete(':id')
  @HttpCode(204)
  removeTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.transferTransactionsService.remove(id);
  }

  private searchCondition = (
    search: string,
    query: TransferTransactionQueryListDto,
  ): FindManyOptions<Transaction> => {
    const where = {};
    if (isNotEmpty(search)) where['name'] = ILike(`%${search}%`);

    if (isDefined(query.account)) where['account'] = { id: query.account };

    if (isDefined(query.toAccount))
      where['toAccount'] = { id: query.toAccount };

    if (isDefined(query.startDate))
      where['date'] = MoreThanOrEqual(query.startDate);

    if (isDefined(query.endDate))
      where['date'] = LessThanOrEqual(query.endDate);

    return { where };
  };
}
