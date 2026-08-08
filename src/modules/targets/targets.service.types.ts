import { RewardType } from 'src/modules/rewards/rewards.types';

export type CreateTargetPayload = {
  title: string;
  description: string;
  shouldBeCompletedAt: string;
  userId: string;
  userTimezone: string;
};

export type GetTargetsPayload = {
  userId: string;
  userTimezone: string;
};

export type TargetCreatedResponse = {
  id: number;
  userId: string;
  title: string;
  description: string;
  status: string;
  shouldBeCompletedAt: string;
};

export type TargetStepListItem = {
  id: number;
  targetId: number;
  title: string;
  description: string;
  shouldBeCompletedAt: string;
  completedAt: string | null;
};

export type TargetRewardListItem = {
  id: number;
  recipientUserId: string | null;
  targetId: number;
  type: RewardType;
  title: string;
  description: string;
  senderUserId: string;
};

export type TargetListItem = {
  id: number;
  userId: string;
  title: string;
  description: string;
  status: string;
  shouldBeCompletedAt: string;
  isOutdated: boolean;
  steps: TargetStepListItem[];
  rewards: TargetRewardListItem[];
};

export type CompleteTargetPayload = {
  targetId: number;
  userId: string;
  userTimezone: string;
  resultComment: string;
};

export type CompletedTargetResponse = {
  completedAt: string | null;
};

export type ActivateTargetPayload = {
  targetId: number;
  userId: string;
  userTimezone: string;
};

export type ActivatedTargetResponse = {
  id: number;
};

export type CancelTargetPayload = {
  targetId: number;
  userId: string;
};

export type CancelledTargetResponse = {
  id: number;
};

export type DeletedTargetPayload = {
  targetId: number;
  userId: string;
};

export type DeletedTargetResponse = {
  id: number;
};
