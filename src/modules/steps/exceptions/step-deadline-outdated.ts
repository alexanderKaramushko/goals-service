import { ConflictException } from '@nestjs/common';

export class StepDeadlineOutdatedException extends ConflictException {
  constructor() {
    super('Дедлайн шага меньше текущей даты');
  }
}
