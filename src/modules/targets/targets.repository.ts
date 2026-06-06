import { Injectable } from '@nestjs/common';
import { DbService } from 'src/modules/db/db.service';
import { TargetRaw } from 'src/modules/targets/targets.types';
import { CreateTargetPayload } from 'src/modules/targets/targets.service.types';

@Injectable()
export class TargetsRepository {
  constructor(private dbService: DbService) {}

  async createTarget(
    payload: Pick<
      CreateTargetPayload,
      'userId' | 'title' | 'description' | 'shouldBeCompletedAt'
    >,
  ): Promise<TargetRaw[]> {
    return this.dbService.query(
      `INSERT INTO targets (user_id, title, description, should_be_completed_at, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
      `,
      [
        payload.userId,
        payload.title,
        payload.description,
        payload.shouldBeCompletedAt,
        'created',
      ],
    );
  }

  async getAllByUserId(userId: string): Promise<TargetRaw[]> {
    return this.dbService.query(
      `SELECT *
        FROM targets t
        WHERE t.user_id = $1
      `,
      [userId],
    );
  }
}
