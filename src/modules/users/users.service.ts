import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/modules/users/users.repository';
import { CreatedUserResponseDto, CreateUserDto } from 'src/modules/users/dto';
import { UserRaw } from 'src/modules/users/users.types';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createOrUpdate(user: CreateUserDto): Promise<CreatedUserResponseDto[]> {
    const users = await this.usersRepository.createOrUpdateUser(user);

    return users.map((userRaw) => this.toCreatedResponseDto(userRaw));
  }

  toCreatedResponseDto(userRaw: UserRaw): CreatedUserResponseDto {
    return {
      id: userRaw.id,
      fullName: userRaw.full_name,
      createdAt: userRaw.created_at!,
    };
  }
}
