import { Injectable } from '@nestjs/common';
import { CreateRewardDto, CreatedRewardResponseDto, RewardType } from './dto';
import { RewardsRepository } from './rewards.repository';
import { RewardRaw } from './rewards.types';

@Injectable()
export class RewardsService {
  constructor(private rewardsRepository: RewardsRepository) {}

  async create(
    createRewardDto: CreateRewardDto,
  ): Promise<CreatedRewardResponseDto[]> {
    const rewards = await this.rewardsRepository.createReward(
      this.toCreateDto(createRewardDto),
    );

    return rewards.map((reward) => this.toCreatedResponseDto(reward));
  }

  toCreateDto(
    createRewardDto: CreateRewardDto,
  ): CreateRewardDto & { type: RewardType } {
    return {
      targetId: createRewardDto.targetId,
      userId: createRewardDto.userId,
      title: createRewardDto.title,
      description: createRewardDto.description,
      type: createRewardDto.userId ? RewardType.user : RewardType.target,
    };
  }

  toCreatedResponseDto(rewardRaw: RewardRaw): CreatedRewardResponseDto {
    return {
      id: rewardRaw.id,
      userId: rewardRaw.user_id,
      targetId: rewardRaw.target_id,
      title: rewardRaw.title,
      description: rewardRaw.description,
      type: rewardRaw.type,
      createdAt: rewardRaw.created_at,
      acceptedAt: rewardRaw.accepted_at,
    };
  }
}
