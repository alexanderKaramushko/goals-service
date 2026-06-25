import { BadRequestException } from '@nestjs/common';

export class RewardAlreadyAssignedException extends BadRequestException {
  constructor() {
    super('Награда уже назначена');
  }
}
