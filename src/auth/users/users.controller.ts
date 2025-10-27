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
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { QueryListDto } from '@shared/dto/query-list.dto';
import { User } from './entities/user.entity';

@ApiTags('Authentication')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a new user account (public endpoint).',
  })
  @ApiCreatedResponse({ type: User })
  @IsPublic()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({
    summary: 'List users',
    description:
      'Returns all users with pagination and optional search filters.',
  })
  @Get()
  findAll(@Query() query: QueryListDto) {
    return this.usersService.findAll(query, (search) => {
      return { where: [{ name: `%${search}%` }, { email: `%${search}%` }] };
    });
  }

  @ApiOperation({
    summary: 'Get user',
    description: 'Retrieves a specific user by ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiOkResponse({ type: User })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update user',
    description: 'Updates user information.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiOkResponse({ type: User })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user account.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiNoContentResponse({ description: 'No content' })
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @ApiOperation({
    summary: 'Check email existence',
    description:
      'Checks if an email address is already registered (public endpoint).',
  })
  @ApiParam({ name: 'email', type: String, description: 'Email address' })
  @ApiOkResponse({
    schema: { example: { exists: true } },
    description: 'Email existence status',
  })
  @IsPublic()
  @Get('exists/:email')
  async existsEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return { exists: !!user };
  }
}
