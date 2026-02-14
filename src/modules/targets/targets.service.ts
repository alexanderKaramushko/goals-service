import { Injectable } from '@nestjs/common';
import type { CreateTargetDto } from './dto';
import { DbService } from 'src/modules/db/db';

@Injectable()
export class TargetsService {
  constructor(private dbService: DbService) {}

  async create(createTargetDto: CreateTargetDto & { userId: string }) {
    return await this.dbService.query(
      `INSERT INTO targets (userId, title, description, shouldBeCompletedAt, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
      `,
      [
        createTargetDto.userId,
        createTargetDto.title,
        createTargetDto.description,
        createTargetDto.shouldBeCompletedAt,
        'created',
      ],
    );
  }
}
