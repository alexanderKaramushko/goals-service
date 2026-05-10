import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserCreateInterceptor } from 'src/interceptors/user-create/user-create.interceptor';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RewardsService } from 'src/modules/rewards/rewards.service';
import { CreatedRewardResponseDto, CreateRewardDto } from 'src/modules/rewards/dto';

@UseInterceptors(UserCreateInterceptor)
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
