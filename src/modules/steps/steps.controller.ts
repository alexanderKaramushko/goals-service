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
import { AuthGuard } from 'src/modules/auth/auth.guard';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { StepsService } from 'src/modules/steps/steps.service';
import {
  CompletedStepResponseDto,
  CompleteStepDto,
  CreatedStepResponseDto,
  CreateStepDto,
} from 'src/modules/steps/steps.dto';
import { type Request as ExpressRequest } from 'express';
import { TimezoneInterceptor } from 'src/interceptors/timezone/timezone.interceptor';

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
  @UseInterceptors(TimezoneInterceptor)
  @Post('create/:targetId')
  async create(
    @Request() request: ExpressRequest,
    @Param('targetId', ParseIntPipe) targetId: number,
    @Body() createStepDto: CreateStepDto,
  ) {
    return this.stepsService.create({
      targetId,
      userTimezone: request.userTimezone as string,
      ...createStepDto,
    });
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
    return this.stepsService.getAllByTargetId({
      targetId,
      userTimezone: request.userTimezone as string,
    });
  }

  @ApiOperation({ summary: 'Завершить шаг у цели' })
  @ApiCreatedResponse({
    description: 'Дата завершения шага',
    type: CompletedStepResponseDto,
  })
  @UseInterceptors(TimezoneInterceptor)
  @Post('complete/:stepId')
  async completeStep(
    @Request() request: ExpressRequest,
    @Body() body: CompleteStepDto,
    @Param('stepId', ParseIntPipe) stepId: number,
  ) {
    return this.stepsService.completeStep({
      stepId: stepId,
      resultComment: body.resultComment,
      userId: request.user?.id as string,
      userTimezone: request.userTimezone as string,
    });
  }
}
