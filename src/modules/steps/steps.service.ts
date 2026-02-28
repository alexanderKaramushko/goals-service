import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db';
import { CreateStepDto } from './dto';

@Injectable()
export class StepsService {
  constructor(private dbService: DbService) {}

  async create(targetId: number, createStepDto: CreateStepDto) {
    return await this.dbService.query(
      `INSERT INTO steps (title, description, target_id, should_be_completed_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
      `,
      [
        createStepDto.title,
        createStepDto.description,
        targetId,
        createStepDto.shouldBeCompletedAt,
      ],
    );
  }
}
