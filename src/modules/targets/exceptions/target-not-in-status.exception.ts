import { BadRequestException } from '@nestjs/common';
import { TargetStatus } from '../targets.types';

export class TargetNotInStatusException extends BadRequestException {
  constructor(status: TargetStatus) {
    super(`Цель должна быть в статусе ${status}`);
  }
}
