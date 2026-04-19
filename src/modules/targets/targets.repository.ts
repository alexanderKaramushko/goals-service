import { Injectable } from '@nestjs/common';
import type { CreateTargetDto } from './dto';
import { DbService } from 'src/modules/db/db';
import { TargetRaw } from './targets.types';

@Injectable()
export class TargetsRepository {
  constructor(private dbService: DbService) {}

  async createTarget(
    createTargetDto: CreateTargetDto & { userId: string },
  ): Promise<TargetRaw[]> {
    return this.dbService.query(
      `INSERT INTO targets (user_id, title, description, should_be_completed_at, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
      `,
      [
        createTargetDto.userId,
        createTargetDto.title,
        createTargetDto.description,
        createTargetDto.shouldBeCompletedAt,
        'created',
      ],
    );
  }

  async getAllByUserId(userId: string): Promise<TargetRaw[]> {
    return this.dbService.query(
      `SELECT * from targets t where t.user_id = $1`,
      [userId],
    );
  }
}
