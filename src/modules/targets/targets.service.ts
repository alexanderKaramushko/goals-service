import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  CreateTargetPayload,
  GetTargetsPayload,
  TargetCreatedResponse,
  TargetListItem,
} from 'src/modules/targets/targets.service.types';
import { dayjs } from 'src/helpers/dayjs';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { TargetRaw } from 'src/modules/targets/targets.types';

@Injectable()
export class TargetsService {
  constructor(private targetsRepository: TargetsRepository) {}

  async create(payload: CreateTargetPayload): Promise<TargetCreatedResponse[]> {
    const currentDate = dayjs(new Date()).tz(payload.userTimezone);
    const shouldBeCompletedAtDate = dayjs(payload.shouldBeCompletedAt);

    if (
      shouldBeCompletedAtDate.isBefore(currentDate, 'day') ||
      shouldBeCompletedAtDate.isSame(currentDate, 'day')
    ) {
      throw new BadRequestException(
        'Дата окончания должна быть больше текущей даты',
      );
    }

    const targets = await this.targetsRepository.createTarget(payload);

    return targets.map((target) => this.toCreatedResponse(target));
  }

  async getAllByUserId(payload: GetTargetsPayload): Promise<TargetListItem[]> {
    const targets = await this.targetsRepository.getAllByUserId(payload.userId);

    return targets.map((target) =>
      this.toListItem(target, payload.userTimezone),
    );
  }

  toCreatedResponse(targetRaw: TargetRaw): TargetCreatedResponse {
    return {
      id: targetRaw.id,
      userId: targetRaw.user_id,
      title: targetRaw.title,
      description: targetRaw.description,
      status: targetRaw.status,
      shouldBeCompletedAt: targetRaw.should_be_completed_at,
    };
  }

  toListItem(targetRaw: TargetRaw, userTimezone: string): TargetListItem {
    const currentDate = dayjs(new Date()).tz(userTimezone);

    const completedAtDate =
      targetRaw.completed_at && dayjs(targetRaw.completed_at);

    const shouldBeCompletedAtDate = dayjs(targetRaw.should_be_completed_at);

    return {
      id: targetRaw.id,
      userId: targetRaw.user_id,
      title: targetRaw.title,
      description: targetRaw.description,
      status: targetRaw.status,
      shouldBeCompletedAt: targetRaw.should_be_completed_at,
      isOutdated: completedAtDate
        ? shouldBeCompletedAtDate.isBefore(completedAtDate, 'day')
        : shouldBeCompletedAtDate.isBefore(currentDate, 'day'),
    };
  }
}
