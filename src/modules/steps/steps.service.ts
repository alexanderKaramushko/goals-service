import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
  DeletedStepResponse,
  DeleteStepPayload,
  GetStepsPayload,
  StepCreatedResponse,
  StepsListItem,
} from 'src/modules/steps/steps.service.types';
import { TargetNotInStatusException } from '../targets/exceptions/target-not-in-status.exception';

@Injectable()
export class StepsService {
  private readonly logger = new Logger(StepsService.name);

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
      closedAt: stepRaw.closed_at,
      createdAt: stepRaw.created_at,
      completedAt: stepRaw.completed_at,
    };
  }

  async create(payload: CreateStepPayload): Promise<StepCreatedResponse[]> {
    const currentDate = dayjs(new Date()).tz(payload.userTimezone);
    const shouldBeCompletedAtDate = dayjs(payload.shouldBeCompletedAt);

    if (
      shouldBeCompletedAtDate.isBefore(currentDate, 'day') ||
      shouldBeCompletedAtDate.isSame(currentDate, 'day')
    ) {
      const exception = new StepDeadlineOutdatedException();
      this.logger.error(exception.message);
      throw exception;
    }

    const stepWithSameShouldBeCompletedAt =
      await this.stepsRepository.findByTargetIdAndShouldBeCompletedAt(
        payload.targetId,
        payload.shouldBeCompletedAt,
      );

    if (stepWithSameShouldBeCompletedAt.length > 0) {
      const [step] = stepWithSameShouldBeCompletedAt;

      const exception = new StepWithSameDeadlineExistsException(
        dayjs(step.should_be_completed_at).format('YYYY-MM-DD'),
      );

      this.logger.error(exception.message);

      throw exception;
    }

    try {
      const steps = await this.stepsRepository.createStep(payload);

      return steps.map((step) => this.toCreatedResponse(step));
    } catch (error) {
      const exception = new BadRequestException(error.message);
      this.logger.error(exception.message);
      throw exception;
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

  toDeletedResponse(stepRaw: StepRaw): DeletedStepResponse {
    return {
      id: stepRaw.id,
    };
  }

  async completeStep(
    payload: CompleteStepPayload,
  ): Promise<CompletedStepResponse> {
    const poolClient = await this.dbService.getPoolClient();

    try {
      await poolClient.query('BEGIN');

      const step = await this.stepsRepository.getStepForUserId(
        {
          stepId: payload.stepId,
          userId: payload.userId,
        },
        poolClient,
      );

      if (!step) {
        const exception = new StepNotFoundException();
        this.logger.error(exception.message);
        throw exception;
      }

      const target = await this.stepsRepository.getTargetByStepId(poolClient, {
        stepId: payload.stepId,
        userId: payload.userId,
      });

      if (target && target.status !== TargetStatus.Active) {
        const exception = new TargetNotActiveException();
        this.logger.error(exception.message);
        throw exception;
      }

      if (step.completed_at !== null) {
        const exception = new StepAlreadyCompletedException();
        this.logger.error(exception.message);
        throw exception;
      }

      const currentDate = dayjs(new Date()).tz(payload.userTimezone);
      const shouldBeCompletedAtDate = dayjs(step.should_be_completed_at);

      if (currentDate.isAfter(shouldBeCompletedAtDate, 'day')) {
        const exception = new StepDeadlineOutdatedException();
        this.logger.error(exception.message);
        throw exception;
      }

      const steps = await this.stepsRepository.getAllAscDeadlineByTargetId(
        poolClient,
        {
          targetId: step.target_id,
        },
      );

      const closestNotOutdatedStep = steps.find(
        (step) =>
          !step.completed_at &&
          !currentDate.isAfter(step.should_be_completed_at, 'day'),
      );

      if (
        closestNotOutdatedStep &&
        closestNotOutdatedStep.id !== payload.stepId
      ) {
        const exception = new StepDeadlineNotClosestException();
        this.logger.error(exception.message);
        throw exception;
      }

      const completedStep = await this.stepsRepository.completeStep(
        {
          stepId: payload.stepId,
          resultComment: payload.resultComment,
        },
        poolClient,
      );

      if (!completedStep) {
        const exception = new BadRequestException('Не удалось завершить шаг');
        this.logger.error(exception.message);
        throw exception;
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

  async deleteStep(payload: DeleteStepPayload): Promise<DeletedStepResponse> {
    const poolClient = await this.dbService.getPoolClient();

    try {
      await poolClient.query('BEGIN');

      const step = await this.stepsRepository.getStepForUserId(
        {
          stepId: payload.stepId,
          userId: payload.userId,
        },
        poolClient,
      );

      if (!step) {
        const exception = new StepNotFoundException();
        this.logger.error(exception.message);
        throw exception;
      }

      const target = await this.stepsRepository.getTargetByStepId(poolClient, {
        stepId: payload.stepId,
        userId: payload.userId,
      });

      if (!target) {
        const exception = new StepNotFoundException();
        this.logger.error(exception.message);
        throw exception;
      }

      if (target.status !== TargetStatus.Created) {
        const exception = new TargetNotInStatusException(TargetStatus.Created);
        this.logger.error(exception.message);
        throw exception;
      }

      const deletedStep = await this.stepsRepository.deleteStep(
        {
          stepId: payload.stepId,
        },
        poolClient,
      );

      if (!deletedStep) {
        const exception = new BadRequestException('Не удалось удалить шаг');
        this.logger.error(exception.message);
        throw exception;
      }

      await poolClient.query('COMMIT');

      return this.toDeletedResponse(deletedStep);
    } catch (error) {
      await poolClient.query('ROLLBACK');
      throw error;
    } finally {
      poolClient.release();
    }
  }
}
