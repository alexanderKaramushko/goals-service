import { TargetsRepository } from 'src/modules/targets/targets.repository';
import {
  CreateTargetRepositoryPayload,
  GetTargetByUserIdPayload,
} from 'src/modules/targets/targets.repository.types';
import { TargetStatus } from 'src/modules/targets/targets.types';

export function createTargetFactory(targetsRepository: TargetsRepository) {
  return (target: CreateTargetRepositoryPayload) => {
    return targetsRepository.createTarget(target);
  };
}

export function getTargetFactory(targetsRepository: TargetsRepository) {
  return (target: GetTargetByUserIdPayload) => {
    return targetsRepository.getByUserId(target);
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
