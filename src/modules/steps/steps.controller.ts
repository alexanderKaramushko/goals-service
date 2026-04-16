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
import { UserCreateInterceptor } from 'src/interceptors/user-create/user-create.interceptor';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { StepsService } from './steps.service';
import { CreatedStepResponseDto, CreateStepDto } from './dto';
import { type Request as ExpressRequest } from 'express';
import { TimezoneInterceptor } from 'src/interceptors/timezone/timezone.interceptor';

@UseInterceptors(UserCreateInterceptor)
@UseGuards(AuthGuard)
@ApiCookieAuth('jwt')
@Controller('steps')
export class StepsController {
  constructor(private stepsService: StepsService) {}

  @ApiOperation({ summary: 'Создать шаг' })
  @ApiCreatedResponse({
    description: 'Шаг создан',
    type: CreatedStepResponseDto,
  })
  @ApiParam({
    name: 'targetId',
    required: true,
    type: Number,
  })
  @Post('create/:targetId')
  async create(
    @Param('targetId', ParseIntPipe) targetId: number,
    @Body() createStepDto: CreateStepDto,
  ) {
    return await this.stepsService.create(targetId, createStepDto);
  }

  @ApiOperation({ summary: 'Все шаги у цели' })
  @ApiCreatedResponse({
    description: 'Список всех шагов цели',
    type: CreatedStepResponseDto,
  })
  @ApiParam({
    name: 'targetId',
    required: true,
    type: Number,
  })
  @UseInterceptors(TimezoneInterceptor)
  @Get('get-all/:targetId')
  async getAll(
    @Request() request: ExpressRequest,
    @Param('targetId', ParseIntPipe) targetId: number,
  ) {
    return await this.stepsService.getAllByTargetId(
      targetId,
      request.userTimezone as string,
    );
  }
}
