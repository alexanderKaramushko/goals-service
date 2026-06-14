import { BadRequestException } from '@nestjs/common';

export class TargetWasNotActivatedException extends BadRequestException {
  constructor() {
    super('Не удалось активировать цель');
  }
}
