import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreatedUserResponseDto, CreateUserDto } from './dto';
import { UserRaw } from './users.types';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(user: CreateUserDto): Promise<CreatedUserResponseDto[]> {
    const users = await this.usersRepository.createUser(user);

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
