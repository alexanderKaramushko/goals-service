import { RewardsService } from 'src/modules/rewards/rewards.service';
import { RewardsRepository } from 'src/modules/rewards/rewards.repository';
import { RewardType } from './rewards.types';
import { DbService } from 'src/modules/db/db.service';
import { TargetsRepository } from 'src/modules/targets/targets.repository';

describe('RewardsService', () => {
  let service: RewardsService;

  beforeEach(() => {
    service = new RewardsService(
      {
        createRewardOnTarget: () => Promise.resolve({} as never),
      } as unknown as RewardsRepository,
      {} as TargetsRepository,
      {
        getPoolClient: () => {},
      } as DbService,
    );
  });

  it('сервис создается', () => {
    expect(service).toBeDefined();
  });

  it('мапит StepRaw в CreatedRewardOnTargetResponseDto', () => {
    const rewardRaw = {
      id: 1,
      recipient_user_id: '108266036103493388680',
      sender_user_id: '108266036103493388681',
      target_id: null,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      type: RewardType.user,
      created_at: '2026-01-01T10:45:30.000Z',
      accepted_at: null,
    };

    expect(service.toCreatedOnTargetResponse(rewardRaw)).toEqual({
      id: rewardRaw.id,
      targetId: rewardRaw.target_id,
      title: rewardRaw.title,
      description: rewardRaw.description,
      type: rewardRaw.type,
      createdAt: rewardRaw.created_at,
      acceptedAt: rewardRaw.accepted_at,
    });
  });

  describe('toCreateOnTargetPayload', () => {
    const valid = {
      title: 'Test',
      description: 'Desc',
      senderUserId: '108266036103493388680',
      targetId: 1,
    };

    it('Выбор типа "target" при передаче targetId', () => {
      expect(
        service.toCreateOnTargetPayload({
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
