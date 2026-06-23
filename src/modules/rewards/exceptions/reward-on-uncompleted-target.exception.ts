import { BadRequestException } from '@nestjs/common';

export class RewardOnUncompletedTargetException extends BadRequestException {
  constructor() {
    super('Нельзя назначить награду на не завершенную цель');
  }
}
