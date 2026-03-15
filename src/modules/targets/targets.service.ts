import { Injectable } from '@nestjs/common';
import type { CreateTargetDto, TargetsResponseDto } from './dto';
import { DbService } from 'src/modules/db/db';
import { Target } from './models';
import { dayjs } from 'src/helpers/dayjs';

@Injectable()
export class TargetsService {
  constructor(private dbService: DbService) {}

  async create(createTargetDto: CreateTargetDto & { userId: string }) {
    return await this.dbService.query(
      `INSERT INTO targets (user_id, title, description, should_be_completed_at, status)
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

  async getAllByUserId(
    userId: string,
    userTimezone: string,
  ): Promise<TargetsResponseDto[]> {
    const targets = await this.dbService.query<Target>(
      `SELECT * from targets t where t.user_id = $1`,
      [userId],
    );

    const currentDate = dayjs.tz(new Date(), userTimezone);

    return targets.map((target) => {
      return {
        id: target.id,
        userId: target.user_id,
        title: target.title,
        description: target.description,
        status: target.status,
        shouldBeCompletedAt: target.should_be_completed_at,
        isOutdated: dayjs(target.should_be_completed_at, 'YYYY-MM-DD').isBefore(
          currentDate,
          'day',
        ),
      };
    });
  }
}
