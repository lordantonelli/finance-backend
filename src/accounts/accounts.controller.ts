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
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { Account } from './entities/account.entity';
import { QueryActiveListDto } from '@shared/dto/query-active-list.dto';
import { FindManyOptions, ILike } from 'typeorm';
import { isDefined, isNotEmpty } from 'class-validator';

@ApiTags('Accounts')
@ApiBearerAuth('access-token')
@Controller('accounts')
@FilterByOwner()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiOperation({
    summary: 'Create account',
    description: 'Creates a new financial account for the authenticated user.',
  })
  @ApiCreatedResponse({ type: Account })
  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @ApiOperation({
    summary: 'List accounts',
    description:
      'Returns accounts for the authenticated user with pagination and optional filters.',
  })
  @ApiPaginatedResponse(Account)
  @Get()
  findAll(@Query() query: QueryActiveListDto) {
    return this.accountsService.findAll(query, this.searchCondition);
  }

  @ApiOperation({
    summary: 'Get account',
    description:
      'Retrieves a specific account by ID (must belong to the authenticated user).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Account ID' })
  @ApiOkResponse({ type: Account })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accountsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update account',
    description: 'Updates account information for the authenticated user.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Account ID' })
  @ApiOkResponse({ type: Account })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, updateAccountDto);
  }

  @ApiOperation({
    summary: 'Delete account',
    description: 'Deletes an account belonging to the authenticated user.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Account ID' })
  @ApiNoContentResponse({ description: 'No content' })
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accountsService.remove(id);
  }

  private searchCondition = (
    search: string,
    query: QueryActiveListDto,
  ): FindManyOptions<Account> => {
    const where = {};
    if (isNotEmpty(search)) where['name'] = ILike(`%${search}%`);

    if (isDefined(query.active)) where['active'] = query.active;

    return { where };
  };
}
