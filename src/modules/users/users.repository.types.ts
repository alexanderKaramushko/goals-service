import { CurrentUserId, Provider, UserId } from './users.types';

export type GetAllUsersRepositoryPayload = {
  currentUserId: CurrentUserId;
};

export type CreateOrUpdateUserRepositoryPayload = {
  name: string;
  subjectId: string;
  provider: Provider;
};

export type GetAllUserTargetsWithStepsPayload = {
  userId: UserId;
  currentUserId: CurrentUserId;
};
