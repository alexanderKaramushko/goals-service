import { DbService } from 'src/modules/db/db.service';
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

export function setTargetStatusFactory(dbService: DbService) {
  return (targetId: number, status: TargetStatus) => {
    return dbService.query(
      `
        UPDATE targets t
        SET status = $1
        WHERE t.id = $2
      `,
      [status, targetId],
    );
  };
}
