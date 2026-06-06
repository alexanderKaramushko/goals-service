import { CreateTargetDto } from 'src/modules/targets/targets.dto';
import { TargetsRepository } from 'src/modules/targets/targets.repository';

export function createTargetFactory(targetsRepository: TargetsRepository) {
  return (target: CreateTargetDto & { userId: string }) => {
    return targetsRepository.createTarget(target);
  };
}
