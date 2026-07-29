import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './users.dto';

@UseGuards(AuthGuard)
@ApiCookieAuth('jwt')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Все пользователи' })
  @ApiResponse({
    description: 'Список всех пользователей',
    type: [UserResponseDto],
  })
  @Get('get-all')
  async getAll() {
    return this.usersService.getAllUsers();
  }
}
