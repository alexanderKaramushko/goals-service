import { Injectable } from '@nestjs/common';
import { DbService } from 'src/modules/db/db.service';
import { UserRaw, UserTargetRaw } from 'src/modules/users/users.types';
import {
  CreateOrUpdateUserRepositoryPayload,
  GetAllUsersRepositoryPayload,
  GetAllUserTargetsWithStepsPayload,
  GetUserByIdRepositoryPayload,
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

  async getAllUsers(payload: GetAllUsersRepositoryPayload): Promise<UserRaw[]> {
    return this.dbService.query(
      `
        SELECT * from users u
        WHERE u.id != $1;
      `,
      [payload.currentUserId],
    );
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
          (
            SELECT json_build_object(
              'id', r.id,
              'targetId', r.target_id,
              'title', r.title,
              'description', r.description,
              'type', r.type,
              'createdAt', r.created_at,
              'acceptedAt', r.accepted_at
            )
            FROM rewards r
            WHERE r.target_id = t.id
              AND r.sender_user_id = $2
              AND r.type = 'target'
          ) AS reward
        FROM targets t
        WHERE t.user_id = $1 AND t.status IN ('active', 'completed')
      `,
      [payload.userId, payload.currentUserId],
    );
  }

  async getUserById(
    payload: GetUserByIdRepositoryPayload,
  ): Promise<UserRaw | undefined> {
    const result = await this.dbService.query<UserRaw>(
      `
        SELECT
          u.id,
          u.full_name,
          u.created_at
        FROM users u
        WHERE u.id = $1
      `,
      [payload.userId],
    );

    const [user] = result;

    return user;
  }
}
