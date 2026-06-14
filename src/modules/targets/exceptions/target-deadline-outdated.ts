import { BadRequestException } from '@nestjs/common';

export class TargetDeadlineOutdatedException extends BadRequestException {
  constructor() {
    super('Дедлайн цели меньше текущей даты');
  }
}
