import { Injectable } from '@nestjs/common';
import { DbService } from 'src/modules/db/db.service';
import { UserRaw, UserTargetRaw } from 'src/modules/users/users.types';
import {
  CreateOrUpdateUserRepositoryPayload,
  GetAllUserTargetsWithStepsPayload,
} from 'src/modules/users/users.repository.types';

@Injectable()
export class UsersRepository {
  constructor(private dbService: DbService) {}

  async createOrUpdateUser(
    payload: CreateOrUpdateUserRepositoryPayload,
  ): Promise<UserRaw[]> {
    return this.dbService.query(
      `INSERT INTO users (id, full_name)
        VALUES ($1, $2)
        ON CONFLICT (id)
        DO UPDATE SET
          full_name = EXCLUDED.full_name
        RETURNING *;
      `,
      [payload.subjectId, payload.name],
    );
  }

  async getAllUsers(): Promise<UserRaw[]> {
    return this.dbService.query(`SELECT * from users;`, []);
  }

  async getAllTargetsByUserIdWithSteps(
    payload: GetAllUserTargetsWithStepsPayload,
  ): Promise<UserTargetRaw[]> {
    return this.dbService.query(
      `
        SELECT
          t.id,
          t.user_id,
          t.title,
          t.description,
          t.status,
          t.should_be_completed_at::text AS should_be_completed_at,
          t.completed_at::text AS completed_at,
          t.cancelled_at,
          t.created_at,
          t.updated_at,
          t.result_comment,
          t.can_assign_reward,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', s.id,
                  'targetId', s.target_id,
                  'title', s.title,
                  'description', s.description,
                  'shouldBeCompletedAt', s.should_be_completed_at::text,
                  'completedAt', s.completed_at::text
                )
              )
              FROM steps s
              WHERE s.target_id = t.id
            ),
            '[]'::json
          ) AS steps,
          EXISTS(
            SELECT 1
            FROM rewards r
            WHERE r.target_id = t.id
              AND r.sender_user_id = $2
              AND r.type = 'target'
          ) AS reward_assigned
        FROM targets t
        WHERE t.user_id = $1 AND t.status IN ('active', 'completed')
      `,
      [payload.userId, payload.currentUserId],
    );
  }
}
