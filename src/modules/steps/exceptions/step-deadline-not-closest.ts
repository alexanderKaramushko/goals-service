import { ConflictException } from '@nestjs/common';

export class StepDeadlineNotClosestException extends ConflictException {
  constructor() {
    super('Шаг является не самым ближайщим по дедлайну');
  }
}
