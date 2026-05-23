import { NotFoundException } from '@nestjs/common';

export class StepNotFoundException extends NotFoundException {
  constructor() {
    super('Шаг не найден');
  }
}
