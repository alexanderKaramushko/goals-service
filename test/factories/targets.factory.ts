import { CreateStepDto } from 'src/modules/steps/dto';
import { TargetsRepository } from 'src/modules/targets/targets.repository';

export function createTargetFactory(targetsRepository: TargetsRepository) {
  return (target: CreateStepDto & { userId: string }) => {
    return targetsRepository.createTarget(target);
  };
}
