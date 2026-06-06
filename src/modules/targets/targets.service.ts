import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  CompletedTargetResponse,
  CompleteTargetPayload,
  CreateTargetPayload,
  GetTargetsPayload,
  TargetCreatedResponse,
  TargetListItem,
} from 'src/modules/targets/targets.service.types';
import { dayjs } from 'src/helpers/dayjs';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { TargetRaw, TargetStatus } from 'src/modules/targets/targets.types';
import { DbService } from '../db/db.service';
import { TargetNotFoundException } from './exceptions/step-not-found.exception';
import { TargetNotActiveException } from './exceptions/target-not-active.exception';
import { TargetDeadlineOutdatedException } from './exceptions/target-deadline-outdated';
import { TargetHasUncompletedStepsException } from './exceptions/target-has-uncompleted-steps.exception';
import { ConfigService } from '@nestjs/config';
import { MAX_OUTDATED_STEPS_PERCENTAGE_FALLBACK } from 'src/constants';

@Injectable()
export class TargetsService {
  constructor(
    private targetsRepository: TargetsRepository,
    private dbService: DbService,
    private configService: ConfigService,
  ) {}

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

  toCompletedResponse(targetRaw: TargetRaw): CompletedTargetResponse {
    return {
      completedAt: targetRaw.completed_at,
    };
  }

  async complete(
    payload: CompleteTargetPayload,
  ): Promise<CompletedTargetResponse> {
    const poolClient = await this.dbService.getPoolClient();

    try {
      await poolClient.query('BEGIN');

      const [target] =
        (await this.targetsRepository.getByUserId(poolClient, {
          userId: payload.userId,
          targetId: payload.targetId,
        })) ?? [];

      if (!target) {
        throw new TargetNotFoundException();
      }

      if (target.status !== TargetStatus.Active) {
        throw new TargetNotActiveException();
      }

      const currentDate = dayjs(new Date()).tz(payload.userTimezone);
      const shouldBeCompletedAtDate = dayjs(target.should_be_completed_at);

      if (currentDate.isAfter(shouldBeCompletedAtDate, 'day')) {
        throw new TargetDeadlineOutdatedException();
      }

      const steps = await this.targetsRepository.getAllTargetSteps(poolClient, {
        targetId: target.id,
      });

      if (
        steps.find(
          (step) =>
            !step.completed_at &&
            !currentDate.isAfter(dayjs(step.should_be_completed_at), 'day'),
        )
      ) {
        throw new TargetHasUncompletedStepsException();
      }

      const outdatedSteps = steps.filter(
        (step) =>
          !step.completed_at &&
          currentDate.isAfter(step.should_be_completed_at, 'day'),
      );

      const outdatedPercentage =
        outdatedSteps.length && steps.length
          ? (outdatedSteps.length / steps.length) * 100
          : 0;

      const maxOutdatedStepsPercentageRaw =
        this.configService.get<string>('MAX_OUTDATED_STEPS_PERCENTAGE') ??
        MAX_OUTDATED_STEPS_PERCENTAGE_FALLBACK.toString();

      const maxOutdatedStepsPercentage = Number.isNaN(
        Number.parseInt(maxOutdatedStepsPercentageRaw, 10),
      )
        ? MAX_OUTDATED_STEPS_PERCENTAGE_FALLBACK
        : Number.parseInt(maxOutdatedStepsPercentageRaw, 10);

      const completedTarget = await this.targetsRepository.completeTarget(
        poolClient,
        {
          targetId: target.id,
          canAssignReward: outdatedPercentage < maxOutdatedStepsPercentage,
          resultComment: payload.resultComment,
        },
      );

      if (!completedTarget) {
        throw new BadRequestException('Не удалось завершить цель');
      }

      await poolClient.query('COMMIT');

      return this.toCompletedResponse(completedTarget);
    } catch (error) {
      await poolClient.query('ROLLBACK');
      throw error;
    } finally {
      poolClient.release();
    }
  }
}
