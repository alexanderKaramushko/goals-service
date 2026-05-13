import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RewardsService } from 'src/modules/rewards/rewards.service';
import {
  CreatedRewardResponseDto,
  CreateRewardDto,
} from 'src/modules/rewards/dto';

@UseGuards(AuthGuard)
@ApiCookieAuth('jwt')
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @ApiOperation({ summary: 'Создать награду' })
  @ApiCreatedResponse({
    description: 'Награда создана',
    type: CreatedRewardResponseDto,
  })
  @Post('create')
  create(@Body() createRewardDto: CreateRewardDto) {
    return this.rewardsService.create(createRewardDto);
  }
}
