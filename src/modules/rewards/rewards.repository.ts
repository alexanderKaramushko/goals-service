import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db';
import { CreateRewardDto, RewardType } from './dto';
import { RewardRaw } from './rewards.types';

@Injectable()
export class RewardsRepository {
  constructor(private dbService: DbService) {}

  async createReward(
    createRewardDto: CreateRewardDto & { type: RewardType },
  ): Promise<RewardRaw[]> {
    return this.dbService.query(
      `INSERT INTO rewards (user_id, target_id, title, description, type)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
          RETURNING *;
        `,
      [
        createRewardDto.userId ?? null,
        createRewardDto.targetId ?? null,
        createRewardDto.title,
        createRewardDto.description,
        createRewardDto.type,
      ],
    );
  }
}
