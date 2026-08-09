import { RewardType } from 'src/modules/rewards/rewards.types';

export enum TargetStatus {
  Created = 'created',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export type TargetStepRaw = {
  id: number;
  targetId: number;
  title: string;
  description: string;
  shouldBeCompletedAt: string;
  completedAt: string | null;
};

export type TargetRewardRaw = {
  id: number;
  recipientUserId: string | null;
  targetId: number;
  type: RewardType;
  title: string;
  description: string;
  senderUserId: string;
};

export type TargetRaw = {
  id: number;
  user_id: string;
  title: string;
  description: string;
  status: TargetStatus;
  should_be_completed_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  result_comment: string | null;
  can_assign_reward: boolean | null;
};

export type TargetRawWithStepsAndRewards = TargetRaw & {
  steps: TargetStepRaw[];
  rewards: TargetRewardRaw[];
};
