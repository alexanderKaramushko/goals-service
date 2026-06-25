import { Injectable } from '@nestjs/common';
import { DbService } from 'src/modules/db/db.service';
import { TargetRaw } from 'src/modules/targets/targets.types';
import { PoolClient } from 'pg';
import {
  CompleteTargetRepositoryPayload,
  CreateTargetRepositoryPayload,
  GetAllTargetStepsPayload,
  UpdateTargetStatusRepositoryPayload,
  GetTargetById,
  GetTargetByIdAndUserIdPayload,
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

  async getByIdAndUserId(
    payload: GetTargetByIdAndUserIdPayload,
    poolClient?: PoolClient,
  ): Promise<TargetRaw> {
    const query = `
      SELECT
        t.id,
        t.user_id,
        t.title,
        t.description,
        t.status,
        t.should_be_completed_at::text AS should_be_completed_at,
        t.completed_at::text AS completed_at,
        t.closed_at,
        t.created_at,
        t.updated_at,
        t.result_comment,
        t.can_assign_reward
      FROM targets t
      WHERE t.user_id = $1 and t.id = $2
      FOR UPDATE;
    `;

    if (poolClient) {
      const result = await poolClient.query<TargetRaw>(query, [
        payload.userId,
        payload.targetId,
      ]);

      const [target] = result.rows;

      return target;
    } else {
      const [target] = await this.dbService.query<TargetRaw>(query, [
        payload.userId,
        payload.targetId,
      ]);

      return target;
    }
  }

  async getById(
    payload: GetTargetById,
    poolClient?: PoolClient,
  ): Promise<TargetRaw | undefined> {
    const query = `
      SELECT
        t.id,
        t.user_id,
        t.title,
        t.description,
        t.status,
        t.should_be_completed_at::text AS should_be_completed_at,
        t.completed_at::text AS completed_at,
        t.closed_at,
        t.created_at,
        t.updated_at,
        t.result_comment,
        t.can_assign_reward
      FROM targets t
      WHERE t.id = $1
      FOR UPDATE;
    `;

    if (poolClient) {
      const result = await poolClient.query<TargetRaw>(query, [
        payload.targetId,
      ]);

      const [target] = result.rows ?? [];

      return target;
    } else {
      const [target] =
        (await this.dbService.query<TargetRaw>(query, [payload.targetId])) ??
        [];

      return target;
    }
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
    payload: CompleteTargetRepositoryPayload,
    poolClient?: PoolClient,
  ): Promise<TargetRaw | undefined> {
    const query = `
      UPDATE targets
          SET completed_at = NOW(),
              status = 'completed',
              can_assign_reward = $2,
              result_comment = $3
        WHERE id = $1 AND completed_at IS NULL
        RETURNING
            id,
            user_id,
            title,
            description,
            status,
            should_be_completed_at::text AS should_be_completed_at,
            completed_at::text AS completed_at,
            closed_at,
            created_at,
            updated_at,
            result_comment,
            can_assign_reward;
    `;

    if (poolClient) {
      const result = await poolClient.query<TargetRaw>(query, [
        payload.targetId,
        payload.canAssignReward,
        payload.resultComment,
      ]);

      const [target] = result.rows;

      return target;
    } else {
      const [target] = await this.dbService.query<TargetRaw>(query, [
        payload.targetId,
        payload.canAssignReward,
        payload.resultComment,
      ]);

      return target;
    }
  }

  async updateTargetStatus(
    poolClient: PoolClient | undefined,
    payload: UpdateTargetStatusRepositoryPayload,
  ): Promise<TargetRaw | undefined> {
    const query = `
      UPDATE targets
      SET status = $2
      WHERE id = $1
      RETURNING *;
    `;

    if (poolClient) {
      const result = await poolClient.query<TargetRaw>(query, [
        payload.targetId,
        payload.status,
      ]);

      const [target] = result.rows;

      return target;
    } else {
      const [target] = await this.dbService.query<TargetRaw>(query, [
        payload.targetId,
        payload.status,
      ]);

      return target;
    }
  }
}
