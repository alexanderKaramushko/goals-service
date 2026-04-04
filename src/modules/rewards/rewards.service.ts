import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db';
import { CreateRewardDto } from './dto';

@Injectable()
export class RewardsService {
  constructor(private dbService: DbService) {}

  async create(createRewardDto: CreateRewardDto) {
    return await this.dbService.query(
      `INSERT INTO rewards (user_id, target_id, title, description, type)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
          RETURNING *;
        `,
      [
        createRewardDto.userId,
        createRewardDto.targetId,
        createRewardDto.title,
        createRewardDto.description,
        createRewardDto.userId ? 'user' : 'target',
      ],
    );
  }
}
