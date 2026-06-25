import { RewardType } from './rewards.types';

export type CreateRewardRepositoryPayload = {
  title: string;
  description: string;
  targetId: number;
  senderUserId: string;
  type: RewardType;
};

export type RewardsOnTargetBySenderUserIdRepositoryPayload = {
  senderUserId: string;
  targetId: number;
};
