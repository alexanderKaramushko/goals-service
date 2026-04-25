import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateStepDto } from './dto';
import { StepRaw } from './steps.types';

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

  async createStep(
    createStepDto: CreateStepDto & { targetId: number },
  ): Promise<StepRaw[]> {
    return this.dbService.query(
      `INSERT INTO steps (title, description, target_id, should_be_completed_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
      `,
      [
        createStepDto.title,
        createStepDto.description,
        createStepDto.targetId,
        createStepDto.shouldBeCompletedAt,
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
}
