import { TargetsRepository } from 'src/modules/targets/targets.repository';
import {
  CreateTargetRepositoryPayload,
  GetTargetByIdAndUserIdPayload,
} from 'src/modules/targets/targets.repository.types';
import { TargetStatus } from 'src/modules/targets/targets.types';

export function createTargetFactory(targetsRepository: TargetsRepository) {
  return (payload: CreateTargetRepositoryPayload) => {
    return targetsRepository.createTarget(payload);
  };
}

export function getTargetFactory(targetsRepository: TargetsRepository) {
  return (payload: GetTargetByIdAndUserIdPayload) => {
    return targetsRepository.getByIdAndUserId(payload);
  };
}

export function setTargetStatusFactory(targetsRepository: TargetsRepository) {
  return (targetId: number, status: TargetStatus) => {
    return targetsRepository.updateTargetStatus(undefined, {
      targetId,
      status,
    });
  };
}
