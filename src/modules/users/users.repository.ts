import { Injectable } from '@nestjs/common';
import { DbService } from 'src/modules/db/db';
import { UserRaw } from './users.types';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersRepository {
  constructor(private dbService: DbService) {}

  async createUser(user: CreateUserDto): Promise<UserRaw[]> {
    return this.dbService.query(
      'INSERT INTO users (id, full_name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING RETURNING *',
      [user.subjectId, user.name],
    );
  }
}
