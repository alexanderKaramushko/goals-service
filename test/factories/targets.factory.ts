import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { CreateTargetRepositoryPayload } from 'src/modules/targets/targets.repository.types';

export function createTargetFactory(targetsRepository: TargetsRepository) {
  return (target: CreateTargetRepositoryPayload) => {
    return targetsRepository.createTarget(target);
  };
}
