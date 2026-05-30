import { Injectable } from '@nestjs/common';
import { DbService } from 'src/modules/db/db.service';
import { UserRaw } from 'src/modules/users/users.types';
import { CreateUserDto } from 'src/modules/users/dto';

@Injectable()
export class UsersRepository {
  constructor(private dbService: DbService) {}

  async createOrUpdateUser(user: CreateUserDto): Promise<UserRaw[]> {
    return this.dbService.query(
      `INSERT INTO users (id, full_name)
        VALUES ($1, $2)
        ON CONFLICT (id)
        DO UPDATE SET
          full_name = EXCLUDED.full_name
        RETURNING *;
      `,
      [user.subjectId, user.name],
    );
  }
}
