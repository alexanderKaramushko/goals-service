import { ConflictException } from '@nestjs/common';

export class TargetNotActiveException extends ConflictException {
  constructor() {
    super('Шаг можно завершить только на активной цели');
  }
}
