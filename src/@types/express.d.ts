import type { CurrentUser } from 'src/modules/users/users.types';

declare global {
  namespace Express {
    interface Request {
      user?: CurrentUser;
      userTimezone?: string;
    }
  }
}

export {};
