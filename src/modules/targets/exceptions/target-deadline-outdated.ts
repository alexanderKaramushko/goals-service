import { ConflictException } from '@nestjs/common';

export class TargetDeadlineOutdatedException extends ConflictException {
  constructor() {
    super('Дедлайн цели меньше текущей даты');
  }
}
