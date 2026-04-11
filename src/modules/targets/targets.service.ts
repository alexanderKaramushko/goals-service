import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateTargetDto, TargetsResponseDto } from './dto';
import { DbService } from 'src/modules/db/db';
import { Target } from './models';
import { dayjs } from 'src/helpers/dayjs';

@Injectable()
export class TargetsService {
  constructor(private dbService: DbService) {}

  async create(
    createTargetDto: CreateTargetDto & { userId: string; userTimezone: string },
  ) {
    const currentDate = dayjs(new Date()).tz(createTargetDto.userTimezone);
    const shouldBeCompletedAtDate = dayjs(createTargetDto.shouldBeCompletedAt);

    if (
      shouldBeCompletedAtDate.isBefore(currentDate, 'day') ||
      shouldBeCompletedAtDate.isSame(currentDate, 'day')
    ) {
      throw new BadRequestException(
        'Дата окончания должна быть больше текущей даты',
      );
    }

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

    return targets.map((target) => {
      const currentDate = dayjs(new Date()).tz(userTimezone);

      const completedAtDate = target.completed_at && dayjs(target.completed_at);
      const shouldBeCompletedAtDate = dayjs(target.should_be_completed_at);

      return {
        id: target.id,
        userId: target.user_id,
        title: target.title,
        description: target.description,
        status: target.status,
        shouldBeCompletedAt: target.should_be_completed_at,
        isOutdated: completedAtDate
          ? shouldBeCompletedAtDate.isBefore(completedAtDate, 'day')
          : shouldBeCompletedAtDate.isBefore(currentDate, 'day'),
      };
    });
  }
}
