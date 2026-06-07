import { StepsRepository } from 'src/modules/steps/steps.repository';
import {
  CompleteStepRepositoryPayload,
  CreateStepRepositoryPayload,
} from 'src/modules/steps/steps.repository.types';

export function createStepFactory(stepsRepository: StepsRepository) {
  return (step: CreateStepRepositoryPayload) => {
    return stepsRepository.createStep(step);
  };
}

export function completeStepFactory(stepsRepository: StepsRepository) {
  return (step: CompleteStepRepositoryPayload) => {
    return stepsRepository.completeStep(step);
  };
}
