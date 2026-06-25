import { StepsRepository } from 'src/modules/steps/steps.repository';
import {
  CompleteStepRepositoryPayload,
  CreateStepRepositoryPayload,
  GetStepForUserIdPayload,
} from 'src/modules/steps/steps.repository.types';

export function createStepFactory(stepsRepository: StepsRepository) {
  return (payload: CreateStepRepositoryPayload) => {
    return stepsRepository.createStep(payload);
  };
}

export function completeStepFactory(stepsRepository: StepsRepository) {
  return (payload: CompleteStepRepositoryPayload) => {
    return stepsRepository.completeStep(payload);
  };
}

export function getStepFactory(stepsRepository: StepsRepository) {
  return (payload: GetStepForUserIdPayload) => {
    return stepsRepository.getStepForUserId(payload);
  };
}
