import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/modules/users/users.repository';
import { UserRaw, UserTargetRaw } from 'src/modules/users/users.types';
import {
  CreateOrUpdateUserPayload,
  CreatedUserResponse,
  GetAllUsersPayload,
  GetUserTargetsPayload,
  UserListItem,
  UserTargetsListItem,
} from 'src/modules/users/users.service.types';
import { UserTargetsResponseDto } from './users.dto';

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

  async getAllUsers(payload: GetAllUsersPayload): Promise<UserListItem[]> {
    const users = await this.usersRepository.getAllUsers({
      currentUserId: payload.currentUserId,
    });

    return users.map((user) => this.toListItem(user));
  }

  toListItem(userRaw: UserRaw): UserListItem {
    return {
      id: userRaw.id,
      fullName: userRaw.full_name,
      createdAt: userRaw.created_at,
    };
  }

  async getUserTargets(
    payload: GetUserTargetsPayload,
  ): Promise<UserTargetsResponseDto[]> {
    const targets = await this.usersRepository.getAllTargetsByUserIdWithSteps({
      userId: payload.userId,
      currentUserId: payload.currentUserId,
    });

    return targets.map((target) => this.toUserTargetsItemResponse(target));
  }

  toUserTargetsItemResponse(userTargetRaw: UserTargetRaw): UserTargetsListItem {
    return {
      id: userTargetRaw.id,
      title: userTargetRaw.title,
      description: userTargetRaw.description,
      status: userTargetRaw.status,
      shouldBeCompletedAt: userTargetRaw.should_be_completed_at,
      canAssignReward: Boolean(userTargetRaw.can_assign_reward),
      reward: userTargetRaw.reward,
      resultComment: userTargetRaw.result_comment,
      steps: userTargetRaw.steps.map((step) => ({
        id: step.id,
        targetId: step.targetId,
        title: step.title,
        description: step.description,
        shouldBeCompletedAt: step.shouldBeCompletedAt,
        completedAt: step.completedAt,
      })),
    };
  }
}
