import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ActivatedTargetResponseDto,
  CompletedTargetResponseDto,
  CompleteTargetDto,
  CreatedTargetResponseDto,
  CreateTargetDto,
  TargetsResponseDto,
} from 'src/modules/targets/targets.dto';
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
@UseInterceptors(TimezoneInterceptor)
@ApiCookieAuth('jwt')
@Controller('targets')
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  @ApiOperation({ summary: 'Создать цель' })
  @ApiCreatedResponse({
    description: 'Цель создана',
    type: CreatedTargetResponseDto,
  })
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
  @Get('get-all/:userId')
  getAll(@Request() request: ExpressRequest, @Param('userId') userId: string) {
    return this.targetsService.getAllByUserId({
      userId,
      userTimezone: request.userTimezone as string,
    });
  }

  @ApiOperation({ summary: 'Завершить цель' })
  @ApiResponse({
    description: 'Цель завершена',
    type: CompletedTargetResponseDto,
  })
  @Post('complete/:targetId')
  completeTarget(
    @Request() request: ExpressRequest,
    @Param('targetId', ParseIntPipe) targetId: number,
    @Body() body: CompleteTargetDto,
  ) {
    return this.targetsService.complete({
      targetId,
      userId: request.user?.id as string,
      userTimezone: request.userTimezone as string,
      resultComment: body.resultComment,
    });
  }

  @ApiOperation({ summary: 'Активировать цель' })
  @ApiResponse({
    description: 'Цель активирована',
    type: ActivatedTargetResponseDto,
  })
  @Post('activate/:targetId')
  activateTarget(
    @Request() request: ExpressRequest,
    @Param('targetId', ParseIntPipe) targetId: number,
  ) {
    return this.targetsService.activate({
      targetId,
      userId: request.user?.id as string,
      userTimezone: request.userTimezone as string,
    });
  }
}
