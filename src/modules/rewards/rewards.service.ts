import { Injectable } from '@nestjs/common';
import { RewardsRepository } from 'src/modules/rewards/rewards.repository';
import { RewardRaw, RewardType } from 'src/modules/rewards/rewards.types';
import {
  CreatedRewardResponse,
  CreateRewardPayload,
} from 'src/modules/rewards/rewards.service.types';

@Injectable()
export class RewardsService {
  constructor(private rewardsRepository: RewardsRepository) {}

  async create(payload: CreateRewardPayload): Promise<CreatedRewardResponse[]> {
    const rewards = await this.rewardsRepository.createReward(
      this.toCreatePayload(payload),
    );

    return rewards.map((reward) => this.toCreatedResponse(reward));
  }

  toCreatePayload(
    payload: CreateRewardPayload,
  ): CreateRewardPayload & { type: RewardType } {
    return {
      targetId: payload.targetId,
      userId: payload.userId,
      title: payload.title,
      description: payload.description,
      type: payload.userId ? RewardType.user : RewardType.target,
    };
  }

  toCreatedResponse(rewardRaw: RewardRaw): CreatedRewardResponse {
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
