import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatedStepResponseDto, CreateStepDto, StepsResponseDto } from './dto';
import { dayjs } from 'src/helpers/dayjs';
import { StepsRepository } from './steps.repository';
import { StepRaw } from './steps.types';

@Injectable()
export class StepsService {
  constructor(private stepsRepository: StepsRepository) {}

  async create(
    createStepDto: CreateStepDto & { targetId: number; userTimezone: string },
  ): Promise<CreatedStepResponseDto[]> {
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

    const stepWithSameShouldBeCompletedAt =
      await this.stepsRepository.findByTargetIdAndShouldBeCompletedAt(
        createStepDto.targetId,
        createStepDto.shouldBeCompletedAt,
      );

    if (stepWithSameShouldBeCompletedAt.length > 0) {
      throw new BadRequestException(
        'Уже есть шаг с датой окончания 2025-01-01',
      );
    }

    const steps = await this.stepsRepository.createStep(createStepDto);

    return steps.map((step) => this.toCreatedResponseDto(step));
  }

  async getAllByTargetId(
    targetId: number,
    userTimezone: string,
  ): Promise<StepsResponseDto[]> {
    const steps = await this.stepsRepository.getAllByTargetId(targetId);

    return steps.map((step) => this.toResponseDto(step, userTimezone));
  }

  toCreatedResponseDto(stepRaw: StepRaw): CreatedStepResponseDto {
    return {
      id: stepRaw.id,
      targetId: stepRaw.target_id!,
      title: stepRaw.title,
      description: stepRaw.description,
      shouldBeCompletedAt: stepRaw.should_be_completed_at,
      closed_at: stepRaw.closed_at,
      created_at: stepRaw.created_at,
      completed_at: stepRaw.completed_at,
    };
  }

  toResponseDto(stepRaw: StepRaw, userTimezone: string): StepsResponseDto {
    const currentDate = dayjs(new Date()).tz(userTimezone);
    const completedAtDate = stepRaw.completed_at && dayjs(stepRaw.completed_at);
    const shouldBeCompletedAtDate = dayjs(stepRaw.should_be_completed_at);

    return {
      id: stepRaw.id,
      targetId: stepRaw.target_id!,
      title: stepRaw.title,
      description: stepRaw.description,
      shouldBeCompletedAt: stepRaw.should_be_completed_at,
      completedAt: stepRaw.completed_at,
      isOutdated: completedAtDate
        ? shouldBeCompletedAtDate.isBefore(completedAtDate, 'day')
        : shouldBeCompletedAtDate.isBefore(currentDate, 'day'),
    };
  }
}
