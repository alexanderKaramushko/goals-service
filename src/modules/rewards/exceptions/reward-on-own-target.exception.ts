import { BadRequestException } from '@nestjs/common';

export class RewardOnOwnTargetException extends BadRequestException {
  constructor() {
    super('Нельзя назначить награду на свою цель');
  }
}
