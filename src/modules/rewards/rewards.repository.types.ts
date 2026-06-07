import { RewardType } from './rewards.types';

export type CreateRewardRepositoryPayload = {
  title: string;
  description: string;
  userId: string;
  targetId: number;
  type: RewardType;
};
