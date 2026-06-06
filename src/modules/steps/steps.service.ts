import { BadRequestException, Injectable } from '@nestjs/common';
import { dayjs } from 'src/helpers/dayjs';
import { StepsRepository } from 'src/modules/steps/steps.repository';
import { StepRaw } from 'src/modules/steps/steps.types';
import { StepNotFoundException } from './exceptions/step-not-found.exception';
import { StepAlreadyCompletedException } from './exceptions/step-already-completed.exception';
import { StepDeadlineOutdatedException } from './exceptions/step-deadline-outdated';
import { StepDeadlineNotClosestException } from './exceptions/step-deadline-not-closest';
import { TargetStatus } from 'src/modules/targets/targets.types';
import { TargetNotActiveException } from './exceptions/target-not-active.exception';
import { DbService } from '../db/db.service';
import { StepWithSameDeadlineExistsException } from './exceptions/step-with-same-deadline-exists.exception';
import {
  CompletedStepResponse,
  CompleteStepPayload,
  CreateStepPayload,
  GetStepsPayload,
  StepCreatedResponse,
  StepsListItem,
} from 'src/modules/steps/steps.service.types';

@Injectable()
export class StepsService {
  constructor(
    private stepsRepository: StepsRepository,
    private dbService: DbService,
  ) {}

  toCreatedResponse(stepRaw: StepRaw): StepCreatedResponse {
    return {
      id: stepRaw.id,
      targetId: stepRaw.target_id,
      title: stepRaw.title,
      description: stepRaw.description,
      shouldBeCompletedAt: stepRaw.should_be_completed_at,
      closed_at: stepRaw.closed_at,
      created_at: stepRaw.created_at,
      completed_at: stepRaw.completed_at,
    };
  }

  async create(payload: CreateStepPayload): Promise<StepCreatedResponse[]> {
    const currentDate = dayjs(new Date()).tz(payload.userTimezone);
    const shouldBeCompletedAtDate = dayjs(payload.shouldBeCompletedAt);

    if (
      shouldBeCompletedAtDate.isBefore(currentDate, 'day') ||
      shouldBeCompletedAtDate.isSame(currentDate, 'day')
    ) {
      throw new StepDeadlineOutdatedException();
    }

    const stepWithSameShouldBeCompletedAt =
      await this.stepsRepository.findByTargetIdAndShouldBeCompletedAt(
        payload.targetId,
        payload.shouldBeCompletedAt,
      );

    if (stepWithSameShouldBeCompletedAt.length > 0) {
      const [step] = stepWithSameShouldBeCompletedAt;

      throw new StepWithSameDeadlineExistsException(
        dayjs(step.should_be_completed_at).format('YYYY-MM-DD'),
      );
    }

    try {
      const steps = await this.stepsRepository.createStep(payload);

      return steps.map((step) => this.toCreatedResponse(step));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  toListItem(stepRaw: StepRaw, userTimezone: string): StepsListItem {
    const currentDate = dayjs(new Date()).tz(userTimezone);
    const completedAtDate = stepRaw.completed_at && dayjs(stepRaw.completed_at);
    const shouldBeCompletedAtDate = dayjs(stepRaw.should_be_completed_at);

    return {
      id: stepRaw.id,
      targetId: stepRaw.target_id,
      title: stepRaw.title,
      description: stepRaw.description,
      shouldBeCompletedAt: stepRaw.should_be_completed_at,
      completedAt: stepRaw.completed_at,
      isOutdated: completedAtDate
        ? shouldBeCompletedAtDate.isBefore(completedAtDate, 'day')
        : shouldBeCompletedAtDate.isBefore(currentDate, 'day'),
    };
  }

  async getAllByTargetId(payload: GetStepsPayload): Promise<StepsListItem[]> {
    const steps = await this.stepsRepository.getAllByTargetId(payload.targetId);

    return steps.map((step) => this.toListItem(step, payload.userTimezone));
  }

  toCompletedResponse(stepRaw: StepRaw): CompletedStepResponse {
    return {
      completedAt: stepRaw.completed_at,
    };
  }

  async completeStep(
    payload: CompleteStepPayload,
  ): Promise<CompletedStepResponse> {
    const poolClient = await this.dbService.getPoolClient();

    try {
      await poolClient.query('BEGIN');

      const step = await this.stepsRepository.getStepForUserId(poolClient, {
        stepId: payload.stepId,
        userId: payload.userId,
      });

      if (!step) {
        throw new StepNotFoundException();
      }

      const target = await this.stepsRepository.getTargetByStepId(poolClient, {
        stepId: payload.stepId,
        userId: payload.userId,
      });

      if (target && target.status !== TargetStatus.Active) {
        throw new TargetNotActiveException();
      }

      if (step.completed_at !== null) {
        throw new StepAlreadyCompletedException();
      }

      const currentDate = dayjs(new Date()).tz(payload.userTimezone);
      const shouldBeCompletedAtDate = dayjs(step.should_be_completed_at);

      if (currentDate.isAfter(shouldBeCompletedAtDate, 'day')) {
        throw new StepDeadlineOutdatedException();
      }

      const [closestStep] =
        await this.stepsRepository.getAllAscDeadlineByTargetId(poolClient, {
          targetId: step.target_id,
        });

      if (closestStep && closestStep.id !== payload.stepId) {
        throw new StepDeadlineNotClosestException();
      }

      const completedStep = await this.stepsRepository.completeStep(
        poolClient,
        {
          stepId: payload.stepId,
          resultComment: payload.resultComment,
        },
      );

      if (!completedStep) {
        throw new BadRequestException('Не удалось завершить шаг');
      }

      await poolClient.query('COMMIT');

      return this.toCompletedResponse(completedStep);
    } catch (error) {
      await poolClient.query('ROLLBACK');
      throw error;
    } finally {
      poolClient.release();
    }
  }
}
