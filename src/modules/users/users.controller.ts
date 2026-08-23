import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto, UserTargetsResponseDto } from './users.dto';
import type { UserId } from './users.types';
import { type Request as ExpressRequest } from 'express';

@UseGuards(AuthGuard)
@ApiCookieAuth('jwt')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Все пользователи' })
  @ApiResponse({
    description: 'Список всех пользователей кроме текущего',
    type: [UserResponseDto],
  })
  @Get('get-all')
  async getAll(@Request() request: ExpressRequest): Promise<UserResponseDto[]> {
    return this.usersService.getAllUsers({
      currentUserId: request.user?.id as string,
    });
  }

  @ApiOperation({ summary: 'Активные и завершенные цели пользователя' })
  @ApiResponse({
    description: 'Список активных и завершенных целей пользователя',
    type: [UserTargetsResponseDto],
  })
  @Get(':userId/targets')
  getUserTargets(
    @Request() request: ExpressRequest,
    @Param('userId') userId: UserId,
  ): Promise<UserTargetsResponseDto[]> {
    return this.usersService.getUserTargets({
      userId,
      currentUserId: request.user?.id as string,
    });
  }

  @ApiOperation({ summary: 'Информация о пользователе' })
  @ApiResponse({
    description: 'Информация о пользователе',
    type: UserResponseDto,
  })
  @Get(':userId')
  getUser(
    @Param('userId', ParseIntPipe) userId: UserId,
  ): Promise<UserResponseDto> {
    return this.usersService.getUser({
      userId,
    });
  }
}
