import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestingApp } from 'src/helpers/create-testing-app';
import { setupTestDatabase } from './utils/setupTestDatabase';
import { createUserFactory } from './factories/users.factory';
import { UsersRepository } from 'src/modules/users/users.repository';
import { Provider } from 'src/modules/users/users.types';
import { UsersModule } from 'src/modules/users/users.module';
import {
  completeTargetFactory,
  createRewardOnTargetFactory,
  createTargetFactory,
  setTargetStatusFactory,
} from './factories';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { TargetStatus } from 'src/modules/targets/targets.types';
import { RewardsRepository } from 'src/modules/rewards/rewards.repository';
import { RewardsModule } from 'src/modules/rewards/rewards.module';
import { RewardType } from 'src/modules/rewards/rewards.types';
import { AUTH_MICROSERVICE } from 'src/modules/microservices/auth/tokens';
import { of } from 'rxjs';

describe('Users (e2e) - GET users/:userId/targets', () => {
  let app: INestApplication;

  const currentUser = {
    subjectId: '1',
    name: 'Test User',
  };
  const rewardSender = {
    subjectId: '2',
    name: 'Reward Sender',
  };
  const otherRewardSender = {
    subjectId: '3',
    name: 'Other Reward Sender',
  };

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  setupTestDatabase(['rewards', 'targets', 'users']);

  it('возвращается пустой список, если подходящих целей нет', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule],
        providers: [
          {
            provide: AUTH_MICROSERVICE,
            useValue: {
              send: () => of([currentUser]),
              emit: () => {},
              connect: () => undefined,
              close: () => undefined,
            },
          },
        ],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));

    await createUser({
      ...currentUser,
      provider: Provider.GOOGLE,
    });

    const [user] = await createUser({
      ...rewardSender,
      provider: Provider.GOOGLE,
    });

    await request(app.getHttpServer())
      .get(`/users/${user.id}/targets`)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });
  });

  it('возвращаются только цели в статусах active и completed', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule],
        providers: [
          {
            provide: AUTH_MICROSERVICE,
            useValue: {
              send: () => of([currentUser]),
              emit: () => {},
              connect: () => undefined,
              close: () => undefined,
            },
          },
        ],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const completeTarget = completeTargetFactory(app.get(TargetsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(TargetsRepository));

    await createUser({
      ...currentUser,
      provider: Provider.GOOGLE,
    });

    const [user] = await createUser({
      ...rewardSender,
      provider: Provider.GOOGLE,
    });

    const [activeTarget] = await createTarget({
      userId: user.id,
      title: 'Сдать экзамен',
      description: 'Закрыть все задачи и получить допуск',
      shouldBeCompletedAt: '2027-02-14',
    });

    await setTargetStatus(activeTarget.id, TargetStatus.Active);

    const [completedTarget] = await createTarget({
      userId: user.id,
      title: 'Завершенная цель',
      description: 'Описание',
      shouldBeCompletedAt: '2027-02-14',
    });

    await completeTarget({
      targetId: completedTarget.id,
      canAssignReward: true,
      resultComment: 'Экзамен сдан',
    });

    await createTarget({
      userId: user.id,
      title: 'Новая цель',
      description: 'Описание',
      shouldBeCompletedAt: '2027-02-14',
    });

    await request(app.getHttpServer())
      .get(`/users/${user.id}/targets`)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual([
          {
            canAssignReward: false,
            description: 'Закрыть все задачи и получить допуск',
            id: activeTarget.id,
            reward: null,
            shouldBeCompletedAt: '2027-02-14',
            status: 'active',
            steps: [],
            title: 'Сдать экзамен',
          },
          {
            canAssignReward: true,
            description: 'Описание',
            id: completedTarget.id,
            reward: null,
            shouldBeCompletedAt: '2027-02-14',
            status: 'completed',
            steps: [],
            title: 'Завершенная цель',
          },
        ]);
      });
  });

  it('возвращает награду, которую текущий пользователь назначил цели', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, RewardsModule],
        providers: [
          {
            provide: AUTH_MICROSERVICE,
            useValue: {
              send: () => of([currentUser]),
              emit: () => {},
              connect: () => undefined,
              close: () => undefined,
            },
          },
        ],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const completeTarget = completeTargetFactory(app.get(TargetsRepository));
    const createRewardOnTarget = createRewardOnTargetFactory(
      app.get(RewardsRepository),
    );

    const [sender] = await createUser({
      ...currentUser,
      provider: Provider.GOOGLE,
    });

    const [targetOwner] = await createUser({
      ...rewardSender,
      provider: Provider.GOOGLE,
    });

    const [target] = await createTarget({
      userId: targetOwner.id,
      title: 'Сдать экзамен',
      description: 'Закрыть все задачи и получить допуск',
      shouldBeCompletedAt: '2027-02-14',
    });

    await completeTarget({
      targetId: target.id,
      canAssignReward: true,
      resultComment: 'Экзамен сдан',
    });

    await createRewardOnTarget({
      senderUserId: sender.id,
      targetId: target.id,
      title: 'Билет в кино',
      description: 'За успешное завершение цели',
      type: RewardType.target,
    });

    await request(app.getHttpServer())
      .get(`/users/${targetOwner.id}/targets`)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual([
          {
            canAssignReward: true,
            description: 'Закрыть все задачи и получить допуск',
            id: target.id,
            reward: {
              acceptedAt: null,
              createdAt: expect.any(String),
              description: 'За успешное завершение цели',
              id: expect.any(Number),
              targetId: target.id,
              title: 'Билет в кино',
              type: RewardType.target,
            },
            shouldBeCompletedAt: '2027-02-14',
            status: 'completed',
            steps: [],
            title: 'Сдать экзамен',
          },
        ]);
      });
  });

  it('возвращает reward = null, если награду назначил другой пользователь', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, RewardsModule],
        providers: [
          {
            provide: AUTH_MICROSERVICE,
            useValue: {
              send: () => of([currentUser]),
              emit: () => {},
              connect: () => undefined,
              close: () => undefined,
            },
          },
        ],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const completeTarget = completeTargetFactory(app.get(TargetsRepository));
    const createRewardOnTarget = createRewardOnTargetFactory(
      app.get(RewardsRepository),
    );

    await createUser({
      ...currentUser,
      provider: Provider.GOOGLE,
    });

    const [targetOwner] = await createUser({
      ...rewardSender,
      provider: Provider.GOOGLE,
    });

    const [sender] = await createUser({
      ...otherRewardSender,
      provider: Provider.GOOGLE,
    });

    const [target] = await createTarget({
      userId: targetOwner.id,
      title: 'Сдать экзамен',
      description: 'Закрыть все задачи и получить допуск',
      shouldBeCompletedAt: '2027-02-14',
    });

    await completeTarget({
      targetId: target.id,
      canAssignReward: true,
      resultComment: 'Экзамен сдан',
    });

    await createRewardOnTarget({
      senderUserId: sender.id,
      targetId: target.id,
      title: 'Билет в кино',
      description: 'За успешное завершение цели',
      type: RewardType.target,
    });

    await request(app.getHttpServer())
      .get(`/users/${targetOwner.id}/targets`)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual([
          {
            canAssignReward: true,
            description: 'Закрыть все задачи и получить допуск',
            id: target.id,
            reward: null,
            shouldBeCompletedAt: '2027-02-14',
            status: 'completed',
            steps: [],
            title: 'Сдать экзамен',
          },
        ]);
      });
  });
});
