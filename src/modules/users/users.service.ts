import { Injectable } from '@nestjs/common';
import { DbService } from 'src/modules/db/db';
import { User } from './types';

@Injectable()
export class UsersService {
  constructor(private dbService: DbService) {}

  async create(user: User) {
    await this.dbService.query(
      'INSERT INTO users (id, full_name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
      [user.subjectId, user.name],
    );
  }
}
