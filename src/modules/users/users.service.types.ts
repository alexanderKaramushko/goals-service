import { StepRaw } from '../steps/steps.types';
import { CurrentUserId, Provider, UserId } from './users.types';

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

export type UserTargetsListItem = {
  id: number;
  userId: string;
  title: string;
  description: string;
  status: string;
  shouldBeCompletedAt: string;
  isOutdated: boolean;
  steps: StepRaw[];
};
