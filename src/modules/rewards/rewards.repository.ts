import { Injectable } from '@nestjs/common';
import { DbService } from 'src/modules/db/db.service';
import { RewardRaw } from 'src/modules/rewards/rewards.types';
import { CreateRewardRepositoryPayload } from 'src/modules/rewards/rewards.repository.types';

@Injectable()
export class RewardsRepository {
  constructor(private dbService: DbService) {}

  async createReward(
    payload: CreateRewardRepositoryPayload,
  ): Promise<RewardRaw[]> {
    return this.dbService.query(
      `INSERT INTO rewards (user_id, target_id, title, description, type)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
      `,
      [
        payload.userId,
        payload.targetId,
        payload.title,
        payload.description,
        payload.type,
      ],
    );
  }
}
