import { TargetsService } from './targets.service';
import { TargetStatus } from './targets.types';
import { TargetsRepository } from './targets.repository';

describe('TargetsService', () => {
  let service: TargetsService;

  beforeEach(() => {
    service = new TargetsService({} as TargetsRepository);
  });

  it('сервис создается', () => {
    expect(service).toBeDefined();
  });

  it('мапит TargetRaw в CreatedTargetResponseDto', () => {
    const targetRaw = {
      id: 1,
      user_id: '108266036103493388680',
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      status: TargetStatus.Created,
      should_be_completed_at: '2026-02-14T10:45:30.000Z',
      completed_at: '',
      closed_at: '',
      created_at: '2026-01-01T10:45:30.000Z',
      updated_at: '2026-01-01T10:45:30.000Z',
    };

    expect(service.toCreatedResponseDto(targetRaw)).toEqual({
      id: targetRaw.id,
      userId: targetRaw.user_id,
      title: targetRaw.title,
      description: targetRaw.description,
      status: targetRaw.status,
      shouldBeCompletedAt: targetRaw.should_be_completed_at,
    });
  });
});
