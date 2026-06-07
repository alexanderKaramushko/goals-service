import { Provider } from './users.types';

export type CreateOrUpdateUserRepositoryPayload = {
  name: string;
  subjectId: string;
  provider: Provider;
};
