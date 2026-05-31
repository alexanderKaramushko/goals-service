import { BadRequestException } from '@nestjs/common';

export class StepWithSameDeadlineExistsException extends BadRequestException {
  constructor(deadline: string) {
    super(`Уже есть шаг с датой окончания ${deadline}`);
  }
}
