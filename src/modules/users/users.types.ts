import { TargetStatus } from 'src/modules/targets/targets.types';

export enum Provider {
  GOOGLE = 'google',
}

export type UserRaw = {
  id: string;
  full_name: string;
  created_at: string | null;
};

export type UserId = UserRaw['id'];

/**
 * Авторизованный пользователь текущей сессии.
 * Создается/находится после успешной аутентификации внешним auth-сервисом
 * и используется в бизнес-логике приложения.
 */
export type CurrentUser = {
  id: string;
  fullName: string;
  createdAt: string | null;
};

export type CurrentUserId = CurrentUser['id'];

export type UserTargetStepRaw = {
  id: number;
  targetId: number;
  title: string;
  description: string;
  shouldBeCompletedAt: string;
  completedAt: string | null;
};

export type UserTargetRaw = {
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
  reward_assigned: boolean;
  steps: UserTargetStepRaw[];
};
