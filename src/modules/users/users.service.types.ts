import { CurrentUserId, Provider, UserId } from './users.types';

export type GetAllUsersPayload = {
  currentUserId: CurrentUserId;
};

export type CreateOrUpdateUserPayload = {
  name: string;
  subjectId: string;
  provider: Provider;
};

export type CreatedUserResponse = {
  id: string;
  fullName: string;
  createdAt: string;
};

export type UserListItem = {
  id: string;
  fullName: string;
  createdAt: string | null;
};

export type GetUserTargetsPayload = {
  userId: UserId;
  currentUserId: CurrentUserId;
};

export type UserTargetStep = {
  id: number;
  targetId: number;
  title: string;
  description: string;
  shouldBeCompletedAt: string;
  completedAt: string | null;
};

export type UserTargetReward = {
  id: number;
  targetId: number;
  title: string;
  description: string;
  type: 'target';
  createdAt: string;
  acceptedAt: string | null;
};

export type UserTargetsListItem = {
  id: number;
  title: string;
  description: string;
  status: string;
  canAssignReward: boolean;
  shouldBeCompletedAt: string;
  resultComment: string | null;
  reward: UserTargetReward | null;
  steps: UserTargetStep[];
};
