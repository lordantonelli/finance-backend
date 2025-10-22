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

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { IsPublic } from '@shared/decorators';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QueryListDto } from '@shared/dto/query-list.dto';
import { User } from './entities/user.entity';

@ApiTags('Authentication')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({ type: User })
  @IsPublic()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() query: QueryListDto) {
    return this.usersService.findAll(query, (search) => {
      return [{ name: `%${search}%` }, { email: `%${search}%` }];
    });
  }

  @ApiOkResponse({ type: User })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @ApiOkResponse({ type: User })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiNoContentResponse({ description: 'No content' })
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @ApiOkResponse({
    schema: { example: { exists: true } },
    description: 'Check if email exists',
  })
  @IsPublic()
  @Get('exists/:email')
  async existsEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return { exists: !!user };
  }
}
