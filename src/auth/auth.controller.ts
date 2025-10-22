import { UserToken } from './models/user-token.model';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiPaginatedResponse,
  CurrentUser,
  IsPublic,
} from '@shared/decorators';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from './users/entities/user.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './models/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: UserToken })
  @IsPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }

  @ApiOkResponse({ type: User })
  @ApiBearerAuth('access-token')
  @Get('me')
  me(@CurrentUser() user: User) {
    return user;
  }
}
