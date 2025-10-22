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
import { QueryListDto } from '@shared/dto/query-list.dto';
import { FindOptionsWhere, ILike } from 'typeorm';
import { isNotEmpty } from 'class-validator';

@ApiTags('Accounts')
@ApiBearerAuth('access-token')
@Controller('accounts/:accountId/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiCreatedResponse({ type: Transaction })
  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @ApiPaginatedResponse(Transaction)
  @Get()
  findAll(@Query() query: QueryListDto) {
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
  ): FindOptionsWhere<Transaction>[] => {
    const condition = {};
    if (isNotEmpty(search)) condition['name'] = ILike(`%${search}%`);

    return [condition];
  };
}
