import { NotFoundException } from '@nestjs/common';

export class TargetNotFoundException extends NotFoundException {
  constructor() {
    super('Цель не найдена');
  }
}
