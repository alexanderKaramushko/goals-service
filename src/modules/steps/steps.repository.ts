import { Injectable } from '@nestjs/common';
import { DbService } from 'src/modules/db/db.service';
import { StepRaw } from 'src/modules/steps/steps.types';
import { TargetRaw } from '../targets/targets.types';
import { PoolClient } from 'pg';
import {
  CompleteStepRepositoryPayload,
  CreateStepRepositoryPayload,
  GetAllAscDeadlineByTargetIdPayload,
  GetStepForUserIdPayload,
  GetTargetByStepIdPayload,
} from 'src/modules/steps/steps.repository.types';

@Injectable()
export class StepsRepository {
  constructor(private dbService: DbService) {}

  async findByTargetIdAndShouldBeCompletedAt(
    targetId: number,
    shouldBeCompletedAt: string,
  ): Promise<StepRaw[]> {
    return this.dbService.query(
      `SELECT *
        FROM steps s
        WHERE s.target_id = $1
        AND s.should_be_completed_at = $2::date
      `,
      [targetId, shouldBeCompletedAt],
    );
  }

  async createStep(payload: CreateStepRepositoryPayload): Promise<StepRaw[]> {
    return this.dbService.query(
      `INSERT INTO steps (title, description, target_id, should_be_completed_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
      `,
      [
        payload.title,
        payload.description,
        payload.targetId,
        payload.shouldBeCompletedAt,
      ],
    );
  }

  async getAllByTargetId(targetId: number): Promise<StepRaw[]> {
    return this.dbService.query(
      `SELECT s.*
        FROM steps s
        INNER JOIN targets t ON t.id = s.target_id
        WHERE s.target_id = $1
        AND t.status IN ('created', 'active')
      `,
      [targetId],
    );
  }

  async getAllAscDeadlineByTargetId(
    poolClient: PoolClient,
    payload: GetAllAscDeadlineByTargetIdPayload,
  ): Promise<StepRaw[]> {
    const result = await poolClient.query(
      `SELECT s.*
        FROM steps s
        INNER JOIN targets t ON t.id = s.target_id
        WHERE s.target_id = $1 AND s.completed_at IS NULL
        ORDER BY s.should_be_completed_at ASC
      `,
      [payload.targetId],
    );

    return result.rows;
  }

  async getStepForUserId(
    payload: GetStepForUserIdPayload,
    poolClient?: PoolClient,
  ): Promise<StepRaw | undefined> {
    const query = `
      SELECT
        s.id,
        s.target_id,
        s.title,
        s.description,
        s.should_be_completed_at::text AS should_be_completed_at,
        s.closed_at,
        s.created_at,
        s.completed_at::text AS completed_at,
        s.result_comment
      FROM steps s
      INNER JOIN targets t ON t.id = s.target_id
      WHERE s.id = $1 AND t.user_id = $2
      FOR UPDATE;
    `;

    if (poolClient) {
      const result = await poolClient.query<StepRaw>(query, [
        payload.stepId,
        payload.userId,
      ]);

      const [step] = result.rows;

      return step;
    } else {
      const [step] = await this.dbService.query<StepRaw>(query, [
        payload.stepId,
        payload.userId,
      ]);

      return step;
    }
  }

  async getTargetByStepId(
    poolClient: PoolClient,
    payload: GetTargetByStepIdPayload,
  ): Promise<TargetRaw | undefined> {
    const result = await poolClient.query<TargetRaw>(
      `SELECT t.*
        FROM steps s
        INNER JOIN targets t ON t.id = s.target_id
        WHERE s.id = $1 AND t.user_id = $2
        FOR UPDATE;
      `,
      [payload.stepId, payload.userId],
    );

    const [target] = result.rows;

    return target;
  }

  async completeStep(
    payload: CompleteStepRepositoryPayload,
    poolClient?: PoolClient,
  ): Promise<StepRaw | undefined> {
    const query = `
      UPDATE steps
      SET completed_at = NOW(),
          result_comment = $2
      WHERE id = $1 AND completed_at IS NULL
      RETURNING
        id,
        target_id,
        title,
        description,
        should_be_completed_at::text AS should_be_completed_at,
        closed_at,
        created_at,
        completed_at::text AS completed_at,
        result_comment;
    `;

    if (poolClient) {
      const result = await poolClient.query<StepRaw>(query, [
        payload.stepId,
        payload.resultComment,
      ]);

      const [step] = result.rows;

      return step;
    } else {
      const [step] = await this.dbService.query<StepRaw>(query, [
        payload.stepId,
        payload.resultComment,
      ]);

      return step;
    }
  }
}
