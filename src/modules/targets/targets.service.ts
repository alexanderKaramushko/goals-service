import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  CreatedTargetResponseDto,
  CreateTargetDto,
  TargetsResponseDto,
} from './dto';
import { dayjs } from 'src/helpers/dayjs';
import { TargetsRepository } from './targets.repository';
import { TargetRaw } from './targets.types';

@Injectable()
export class TargetsService {
  constructor(private targetsRepository: TargetsRepository) {}

  async create(
    createTargetDto: CreateTargetDto & { userId: string; userTimezone: string },
  ): Promise<CreatedTargetResponseDto[]> {
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

    const targets = await this.targetsRepository.createTarget(createTargetDto);

    return targets.map((target) => this.toCreatedResponseDto(target));
  }

  async getAllByUserId(
    userId: string,
    userTimezone: string,
  ): Promise<TargetsResponseDto[]> {
    const targets = await this.targetsRepository.getAllByUserId(userId);

    return targets.map((target) => this.toResponseDto(target, userTimezone));
  }

  toCreatedResponseDto(targetRaw: TargetRaw): CreatedTargetResponseDto {
    return {
      id: targetRaw.id,
      userId: targetRaw.user_id,
      title: targetRaw.title,
      description: targetRaw.description,
      status: targetRaw.status,
      shouldBeCompletedAt: targetRaw.should_be_completed_at,
    };
  }

  toResponseDto(
    targetRaw: TargetRaw,
    userTimezone: string,
  ): TargetsResponseDto {
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
