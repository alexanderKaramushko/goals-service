export enum Provider {
  GOOGLE = 'google',
}

export type UserRaw = {
  id: string;
  full_name: string;
  created_at: string | null;
};

/**
 * Локальный пользователь текущего сервиса.
 * Создается/находится после успешной аутентификации внешним auth-сервисом
 * и используется в бизнес-логике приложения.
 */
export type CurrentUser = {
  id: string;
  fullName: string;
  createdAt: string | null;
};
