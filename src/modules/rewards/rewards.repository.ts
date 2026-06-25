import { Injectable } from '@nestjs/common';
import { DbService } from 'src/modules/db/db.service';
import { RewardRaw } from 'src/modules/rewards/rewards.types';
import {
  CreateRewardRepositoryPayload,
  RewardsOnTargetBySenderUserIdRepositoryPayload,
} from 'src/modules/rewards/rewards.repository.types';
import { PoolClient } from 'pg';

@Injectable()
export class RewardsRepository {
  constructor(private dbService: DbService) {}

  async createRewardOnTarget(
    payload: CreateRewardRepositoryPayload,
    poolClient?: PoolClient,
  ): Promise<RewardRaw> {
    const query = `
      INSERT INTO rewards (sender_user_id, target_id, title, description, type)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `;

    if (poolClient) {
      const result = await poolClient.query<RewardRaw>(query, [
        payload.senderUserId,
        payload.targetId,
        payload.title,
        payload.description,
        payload.type,
      ]);

      const [reward] = result.rows;

      return reward;
    } else {
      const [reward] = await this.dbService.query<RewardRaw>(query, [
        payload.senderUserId,
        payload.targetId,
        payload.title,
        payload.description,
        payload.type,
      ]);

      return reward;
    }
  }

  async getRewardsOnTargetBySenderUserId(
    payload: RewardsOnTargetBySenderUserIdRepositoryPayload,
    poolClient?: PoolClient,
  ): Promise<RewardRaw[]> {
    const query = `
      SELECT * from rewards r
      WHERE r.sender_user_id = $1 AND r.target_id=$2 AND r.type = 'target'
      FOR UPDATE;
    `;

    if (poolClient) {
      const result = await poolClient.query<RewardRaw>(query, [
        payload.senderUserId,
        payload.targetId,
      ]);

      return result.rows;
    } else {
      return this.dbService.query<RewardRaw>(query, [
        payload.senderUserId,
        payload.targetId,
      ]);
    }
  }
}
