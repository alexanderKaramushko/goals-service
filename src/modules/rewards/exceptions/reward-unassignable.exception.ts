import { BadRequestException } from '@nestjs/common';

export class RewardUnassignableException extends BadRequestException {
  constructor() {
    super('Нельзя назначить награду');
  }
}
