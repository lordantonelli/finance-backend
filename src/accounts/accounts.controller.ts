import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiPaginatedResponse, FilterByOwner } from '@shared/decorators';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Account } from './entities/account.entity';
import { QueryActiveListDto } from '@shared/dto/query-active-list.dto';
import { FindOptionsWhere, ILike } from 'typeorm';
import { isDefined, isNotEmpty } from 'class-validator';

@ApiTags('Accounts')
@ApiBearerAuth('access-token')
@Controller('accounts')
@FilterByOwner()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiCreatedResponse({ type: Account })
  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @ApiPaginatedResponse(Account)
  @Get()
  findAll(@Query() query: QueryActiveListDto) {
    return this.accountsService.findAll(query, this.searchCondition);
  }

  @ApiOkResponse({ type: Account })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accountsService.findOne(id);
  }

  @ApiOkResponse({ type: Account })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, updateAccountDto);
  }

  @ApiNoContentResponse({ description: 'No content' })
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accountsService.remove(id);
  }

  private searchCondition = (
    search: string,
    query: QueryActiveListDto,
  ): FindOptionsWhere<Account>[] => {
    const condition = {};
    if (isNotEmpty(search)) condition['name'] = ILike(`%${search}%`);

    if (isDefined(query.active)) condition['active'] = query.active;

    return [condition];
  };
}
