import { ConflictException } from '@nestjs/common';

export class TargetNotActiveException extends ConflictException {
  constructor() {
    super('Можно завершить только активную цель');
  }
}
