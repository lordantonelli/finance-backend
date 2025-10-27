import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { CurrentUser, IsPublic } from '@shared/decorators';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
    summary: 'Get current user',
    description: 'Retrieves the currently authenticated user.',
  })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: User })
  @Get('me')
  findMe(@CurrentUser() user: User) {
    return user;
  }

  @ApiOperation({
    summary: 'Update current user',
    description: 'Updates the authenticated user information.',
  })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: User })
  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @ApiOperation({
    summary: 'Delete current user',
    description: 'Deletes the authenticated user account.',
  })
  @ApiBearerAuth('access-token')
  @ApiNoContentResponse({ description: 'No content' })
  @Delete('me')
  @HttpCode(204)
  removeMe(@CurrentUser() user: User) {
    return this.usersService.remove(user.id);
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
