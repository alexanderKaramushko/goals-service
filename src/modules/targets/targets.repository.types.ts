import { TargetStatus } from './targets.types';

export type CreateTargetRepositoryPayload = {
  userId: string;
  title: string;
  description: string;
  shouldBeCompletedAt: string;
};

export type GetTargetByIdAndUserIdPayload = {
  userId: string;
  targetId: number;
};

export type GetTargetById = {
  targetId: number;
};

export type GetAllTargetStepsPayload = {
  targetId: number;
};

export type CompleteTargetRepositoryPayload = {
  targetId: number;
  canAssignReward: boolean;
  resultComment: string;
};

export type UpdateTargetStatusRepositoryPayload = {
  targetId: number;
  status: TargetStatus;
};

export type DeleteTargetRepositoryPayload = {
  targetId: number;
  userId: string;
};

export type CancelTargetRepositoryPayload = {
  targetId: number;
};
