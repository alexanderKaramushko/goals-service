import { Provider } from './users.types';

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
