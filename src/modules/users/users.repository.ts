import { Injectable } from '@nestjs/common';
import { DbService } from 'src/modules/db/db.service';
import { UserRaw } from 'src/modules/users/users.types';
import { CreateOrUpdateUserPayload } from 'src/modules/users/users.service.types';

@Injectable()
export class UsersRepository {
  constructor(private dbService: DbService) {}

  async createOrUpdateUser(
    payload: CreateOrUpdateUserPayload,
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
}
