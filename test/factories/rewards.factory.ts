import { RewardsRepository } from 'src/modules/rewards/rewards.repository';
import {
  CreateRewardRepositoryPayload,
  RewardsOnTargetBySenderUserIdRepositoryPayload,
} from 'src/modules/rewards/rewards.repository.types';

export function createRewardOnTargetFactory(
  rewardsRepository: RewardsRepository,
) {
  return (payload: CreateRewardRepositoryPayload) => {
    return rewardsRepository.createRewardOnTarget(payload);
  };
}

export function getRewardsOnTargetBySenderUserIdFactory(
  rewardsRepository: RewardsRepository,
) {
  return (payload: RewardsOnTargetBySenderUserIdRepositoryPayload) => {
    return rewardsRepository.getRewardsOnTargetBySenderUserId(payload);
  };
}
