import { BadRequestException } from '@nestjs/common';

export class TargetHasOutdatedStepsException extends BadRequestException {
  constructor() {
    super('Цель имеет просроченные шаги');
  }
}
