import { Injectable } from '@nestjs/common';
import { DbService } from 'src/modules/db/db.service';
import { TargetRaw } from 'src/modules/targets/targets.types';
import { PoolClient } from 'pg';
import {
  CompleteTargetRepositoryPayload,
  CreateTargetRepositoryPayload,
  GetAllTargetStepsPayload,
  GetTargetByUserIdPayload,
} from 'src/modules/targets/targets.repository.types';

@Injectable()
export class TargetsRepository {
  constructor(private dbService: DbService) {}

  async createTarget(
    payload: CreateTargetRepositoryPayload,
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

  async getByUserId(
    poolClient: PoolClient,
    payload: GetTargetByUserIdPayload,
  ): Promise<TargetRaw[]> {
    const result = await poolClient.query<TargetRaw>(
      `SELECT *
        FROM targets t
        WHERE t.user_id = $1 and t.id = $2
        FOR UPDATE;
      `,
      [payload.userId, payload.targetId],
    );

    return result.rows;
  }

  async getAllTargetSteps(
    poolClient: PoolClient,
    payload: GetAllTargetStepsPayload,
  ): Promise<TargetRaw[]> {
    const result = await poolClient.query<TargetRaw>(
      `SELECT *
        FROM steps s
        WHERE s.target_id = $1
        FOR UPDATE;
      `,
      [payload.targetId],
    );

    return result.rows;
  }

  async completeTarget(
    poolClient: PoolClient,
    payload: CompleteTargetRepositoryPayload,
  ): Promise<TargetRaw | undefined> {
    const result = await poolClient.query<TargetRaw>(
      `UPDATE targets
          SET completed_at = NOW(),
              status = 'completed',
              can_assign_reward = $2,
              result_comment = $3
        WHERE id = $1 AND completed_at IS NULL
        RETURNING *;
      `,
      [payload.targetId, payload.canAssignReward, payload.resultComment],
    );

    const [target] = result.rows;

    return target;
  }
}
