import { ConflictException } from '@nestjs/common';

export class TargetHasUncompletedStepsException extends ConflictException {
  constructor() {
    super('Цель имеет незавершенные шаги');
  }
}
