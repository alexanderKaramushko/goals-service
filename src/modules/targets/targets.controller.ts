import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  CreatedTargetResponseDto,
  CreateTargetDto,
  TargetsResponseDto,
} from 'src/modules/targets/dto';
import { TargetsService } from 'src/modules/targets/targets.service';

import { type Request as ExpressRequest } from 'express';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { TimezoneInterceptor } from 'src/interceptors/timezone/timezone.interceptor';
import { CurrentUser } from '../users/users.types';

@UseGuards(AuthGuard)
@ApiCookieAuth('jwt')
@Controller('targets')
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  @ApiOperation({ summary: 'Создать цель' })
  @ApiCreatedResponse({
    description: 'Цель создана',
    type: CreatedTargetResponseDto,
  })
  @UseInterceptors(TimezoneInterceptor)
  @Post('create')
  create(
    @Body() createTargetDto: CreateTargetDto,
    @Request() request: ExpressRequest & { user: CurrentUser },
  ) {
    return this.targetsService.create({
      userId: request.user.id,
      userTimezone: request.userTimezone as string,
      ...createTargetDto,
    });
  }

  @ApiOperation({ summary: 'Все цели пользователя' })
  @ApiResponse({
    description: 'Список всех целей пользователя',
    type: [TargetsResponseDto],
  })
  @UseInterceptors(TimezoneInterceptor)
  @Get('get-all/:userId')
  getAll(@Request() request: ExpressRequest, @Param('userId') userId: string) {
    return this.targetsService.getAllByUserId(
      userId,
      request.userTimezone as string,
    );
  }
}
