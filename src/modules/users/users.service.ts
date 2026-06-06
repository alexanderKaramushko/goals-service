import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/modules/users/users.repository';
import { UserRaw } from 'src/modules/users/users.types';
import {
  CreateOrUpdateUserPayload,
  CreatedUserResponse,
} from 'src/modules/users/users.service.types';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createOrUpdate(
    payload: CreateOrUpdateUserPayload,
  ): Promise<CreatedUserResponse[]> {
    const users = await this.usersRepository.createOrUpdateUser(payload);

    return users.map((userRaw) => this.toCreatedResponse(userRaw));
  }

  toCreatedResponse(userRaw: UserRaw): CreatedUserResponse {
    return {
      id: userRaw.id,
      fullName: userRaw.full_name,
      createdAt: userRaw.created_at!,
    };
  }
}
