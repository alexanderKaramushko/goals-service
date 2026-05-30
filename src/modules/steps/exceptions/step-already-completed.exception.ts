import { ConflictException } from '@nestjs/common';

export class StepAlreadyCompletedException extends ConflictException {
  constructor() {
    super('Шаг уже завершен');
  }
}
