import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RewardsService } from 'src/modules/rewards/rewards.service';
import {
  CreatedRewardOnTargetResponseDto,
  CreateRewardOnTargetDto,
} from 'src/modules/rewards/rewards.dto';
import { type Request as ExpressRequest } from 'express';
import { CurrentUserId } from '../users/users.types';

@UseGuards(AuthGuard)
@ApiCookieAuth('jwt')
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @ApiOperation({ summary: 'Создать награду' })
  @ApiCreatedResponse({
    description: 'Награда создана',
    type: CreatedRewardOnTargetResponseDto,
  })
  @Post('create/:targetId')
  create(
    @Request() request: ExpressRequest,
    @Body() createRewardDto: CreateRewardOnTargetDto,
    @Param('targetId', ParseIntPipe) targetId: number,
  ) {
    return this.rewardsService.createOnTarget({
      title: createRewardDto.title,
      description: createRewardDto.description,
      targetId,
      senderUserId: request.user?.id as CurrentUserId,
    });
  }
}
