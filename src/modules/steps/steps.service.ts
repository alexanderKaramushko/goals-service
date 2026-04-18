import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from '../db/db';
import { CreateStepDto, StepsResponseDto } from './dto';
import { Step } from './models';
import { dayjs } from 'src/helpers/dayjs';

@Injectable()
export class StepsService {
  constructor(private dbService: DbService) {}

  async create(
    createStepDto: CreateStepDto & { targetId: number; userTimezone: string },
  ) {
    const currentDate = dayjs(new Date()).tz(createStepDto.userTimezone);
    const shouldBeCompletedAtDate = dayjs(createStepDto.shouldBeCompletedAt);

    if (
      shouldBeCompletedAtDate.isBefore(currentDate, 'day') ||
      shouldBeCompletedAtDate.isSame(currentDate, 'day')
    ) {
      throw new BadRequestException(
        'Дата окончания должна быть больше текущей даты',
      );
    }

    const stepWithSameShouldBeCompletedAt = await this.dbService.query<Step>(
      `SELECT EXISTS (
        SELECT 1
        FROM steps s
        WHERE s.target_id = $1
        AND s.should_be_completed_at = $2::date
      ) AS "exists"
      `,
      [createStepDto.targetId, createStepDto.shouldBeCompletedAt],
    );

    if (stepWithSameShouldBeCompletedAt.length > 0) {
      throw new BadRequestException(
        'Уже есть шаг с датой окончания 2025-01-01',
      );
    }

    return await this.dbService.query(
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

  async getAllByTargetId(
    targetId: number,
    userTimezone: string,
  ): Promise<StepsResponseDto[]> {
    const steps = await this.dbService.query<Step>(
      `
        SELECT s.* from steps s
        INNER JOIN targets t ON t.id = s.target_id
        WHERE s.target_id = $1 AND t.status IN ('created', 'active')
      `,
      [targetId],
    );

    return steps.map((step) => {
      const currentDate = dayjs(new Date()).tz(userTimezone);

      const completedAtDate = step.completed_at && dayjs(step.completed_at);
      const shouldBeCompletedAtDate = dayjs(step.should_be_completed_at);

      return {
        id: step.id,
        targetId: step.target_id!,
        title: step.title,
        description: step.description,
        shouldBeCompletedAt: step.should_be_completed_at,
        completedAt: step.completed_at,
        isOutdated: completedAtDate
          ? shouldBeCompletedAtDate.isBefore(completedAtDate, 'day')
          : shouldBeCompletedAtDate.isBefore(currentDate, 'day'),
      };
    });
  }
}
