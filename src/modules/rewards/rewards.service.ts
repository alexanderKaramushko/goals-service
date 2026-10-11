import { Injectable, Logger } from '@nestjs/common';
import { RewardsRepository } from 'src/modules/rewards/rewards.repository';
import { RewardRaw, RewardType } from 'src/modules/rewards/rewards.types';
import { CreateRewardRepositoryPayload } from 'src/modules/rewards/rewards.repository.types';
import {
  CreatedRewardOnTargetResponse,
  CreateRewardOnTargetPayload,
} from 'src/modules/rewards/rewards.service.types';
import { DbService } from 'src/modules/db/db.service';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { TargetNotFoundException } from 'src/modules/targets/exceptions/target-not-found.exception';
import { TargetStatus } from 'src/modules/targets/targets.types';
import { RewardOnUncompletedTargetException } from './exceptions/reward-on-uncompleted-target.exception';
import { RewardUnassignableException } from './exceptions/reward-unassignable.exception';
import { RewardAlreadyAssignedException } from './exceptions/reward-already-assigned.exception';
import { RewardOnOwnTargetException } from './exceptions/reward-on-own-target.exception';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    private rewardsRepository: RewardsRepository,
    private targetsRepository: TargetsRepository,
    private dbService: DbService,
  ) {}

  async createOnTarget(
    payload: CreateRewardOnTargetPayload,
  ): Promise<CreatedRewardOnTargetResponse> {
    const poolClient = await this.dbService.getPoolClient();

    try {
      await poolClient.query('BEGIN');

      const target = await this.targetsRepository.getById(
        { targetId: payload.targetId },
        poolClient,
      );

      if (!target) {
        const exception = new TargetNotFoundException();
        this.logger.error(exception.message);
        throw exception;
      }

      if (target.user_id === payload.senderUserId) {
        const exception = new RewardOnOwnTargetException();
        this.logger.error(exception.message);
        throw exception;
      }

      if (target.status !== TargetStatus.Completed) {
        const exception = new RewardOnUncompletedTargetException();
        this.logger.error(exception.message);
        throw exception;
      }

      if (!target.can_assign_reward) {
        const exception = new RewardUnassignableException();
        this.logger.error(exception.message);
        throw exception;
      }

      const senderRewardsOnTarget =
        await this.rewardsRepository.getRewardsOnTargetBySenderUserId(
          { senderUserId: payload.senderUserId, targetId: payload.targetId },
          poolClient,
        );

      if (senderRewardsOnTarget.length > 0) {
        const exception = new RewardAlreadyAssignedException();
        this.logger.error(exception.message);
        throw exception;
      }

      const createdReward = await this.rewardsRepository.createRewardOnTarget(
        this.toCreateOnTargetPayload(payload),
        poolClient,
      );

      await poolClient.query('COMMIT');

      return this.toCreatedOnTargetResponse(createdReward);
    } catch (error) {
      await poolClient.query('ROLLBACK');
      throw error;
    } finally {
      poolClient.release();
    }
  }

  toCreateOnTargetPayload(
    payload: CreateRewardOnTargetPayload,
  ): CreateRewardRepositoryPayload {
    return {
      targetId: payload.targetId,
      senderUserId: payload.senderUserId,
      title: payload.title,
      description: payload.description,
      type: RewardType.target,
    };
  }

  toCreatedOnTargetResponse(
    rewardRaw: RewardRaw,
  ): CreatedRewardOnTargetResponse {
    return {
      id: rewardRaw.id,
      targetId: rewardRaw.target_id,
      title: rewardRaw.title,
      description: rewardRaw.description,
      type: rewardRaw.type,
      createdAt: rewardRaw.created_at,
      acceptedAt: rewardRaw.accepted_at,
    };
  }
}
