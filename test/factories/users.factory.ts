import { CreateUserDto } from 'src/modules/users/dto';
import { UsersRepository } from 'src/modules/users/users.repository';

export function createUserFactory(usersRepository: UsersRepository) {
  return (user: CreateUserDto) => {
    return usersRepository.createUser(user);
  };
}
