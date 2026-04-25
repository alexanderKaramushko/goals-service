import { RewardsService } from './rewards.service';
import { RewardsRepository } from './rewards.repository';
import { RewardType } from './dto';

describe('RewardsService', () => {
  let service: RewardsService;

  beforeEach(() => {
    service = new RewardsService({
      createReward: () => [],
    } as unknown as RewardsRepository);
  });

  it('сервис создается', () => {
    expect(service).toBeDefined();
  });

  it('мапит StepRaw в CreatedRewardResponseDto', () => {
    const rewardRaw = {
      id: 1,
      user_id: '108266036103493388680',
      target_id: null,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      type: RewardType.user,
      created_at: '2026-01-01T10:45:30.000Z',
      accepted_at: null,
    };

    expect(service.toCreatedResponseDto(rewardRaw)).toEqual({
      id: rewardRaw.id,
      userId: rewardRaw.user_id,
      targetId: rewardRaw.target_id,
      title: rewardRaw.title,
      description: rewardRaw.description,
      type: rewardRaw.type,
      createdAt: rewardRaw.created_at,
      acceptedAt: rewardRaw.accepted_at,
    });
  });

  describe('toCreateDto', () => {
    const valid = {
      title: 'Test',
      description: 'Desc',
    };

    it('Выбор типа "user" при передаче userId', () => {
      expect(
        service.toCreateDto({
          ...valid,
          userId: '108266036103493388680',
        }),
      ).toEqual(
        expect.objectContaining({
          type: RewardType.user,
        }),
      );
    });

    it('Выбор типа "target" при передаче targetId', () => {
      expect(
        service.toCreateDto({
          ...valid,
          targetId: 1,
        }),
      ).toEqual(
        expect.objectContaining({
          type: RewardType.target,
        }),
      );
    });
  });
});
