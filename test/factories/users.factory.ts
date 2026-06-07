import { UsersRepository } from 'src/modules/users/users.repository';
import { CreateOrUpdateUserRepositoryPayload } from 'src/modules/users/users.repository.types';

export function createUserFactory(usersRepository: UsersRepository) {
  return (user: CreateOrUpdateUserRepositoryPayload) => {
    return usersRepository.createOrUpdateUser(user);
  };
}
