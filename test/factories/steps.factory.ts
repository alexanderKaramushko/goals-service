import { CreateStepDto } from 'src/modules/steps/steps.dto';
import { StepsRepository } from 'src/modules/steps/steps.repository';

export function createStepFactory(stepsRepository: StepsRepository) {
  return (step: CreateStepDto & { targetId: number }) => {
    return stepsRepository.createStep(step);
  };
}
