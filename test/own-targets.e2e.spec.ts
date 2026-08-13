import { INestApplication } from '@nestjs/common';
import { setupTestDatabase } from './utils/setupTestDatabase';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { createTestingApp } from 'src/helpers/create-testing-app';
import {
  createRewardOnTargetFactory,
  createStepFactory,
  createTargetFactory,
} from './factories';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { createUserFactory } from './factories/users.factory';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersRepository } from 'src/modules/users/users.repository';
import { Provider } from 'src/modules/users/users.types';
import request from 'supertest';
import { AUTH_MICROSERVICE } from 'src/modules/microservices/auth/tokens';
import { of } from 'rxjs';
import { StepsRepository } from 'src/modules/steps/steps.repository';
import { StepsModule } from 'src/modules/steps/steps.module';
import { dayjs } from 'src/helpers/dayjs';
import { RewardsModule } from 'src/modules/rewards/rewards.module';
import { RewardsRepository } from 'src/modules/rewards/rewards.repository';
import { RewardType } from 'src/modules/rewards/rewards.types';

describe('Targets (e2e) - /GET targets/get-all-own', () => {
  let app: INestApplication;

  const currentUser = {
    subjectId: '1',
    name: 'Test User',
  };
  const rewardSender = {
    subjectId: '2',
    name: 'Reward Sender',
  };

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  setupTestDatabase(['targets', 'users']);

  it('должен возвращать цель без шагов и без наград', async () => {
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

    const [user] = await createUser({
      name: currentUser.name,
      provider: Provider.GOOGLE,
      subjectId: currentUser.subjectId,
    });

    const [target] = await createTarget({
      userId: user.id,
      title: 'Сдать экзамен',
      description: 'Закрыть все задачи и получить допуск',
      shouldBeCompletedAt: '2027-02-14',
    });

    await request(app.getHttpServer())
      .get(`/targets/get-all-own`)
      .set('x-user-timezone', 'Europe/Moscow')
      .expect((res) => {
        expect(res.body).toEqual([
          {
            description: 'Закрыть все задачи и получить допуск',
            id: target.id,
            isOutdated: expect.any(Boolean),
            resultComment: null,
            rewards: [],
            shouldBeCompletedAt: '2027-02-14',
            status: 'created',
            steps: [],
            title: 'Сдать экзамен',
            userId: user.id,
          },
        ]);
      });
  });

  it('возвращается цель с несколькими шагами', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
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
    const createStep = createStepFactory(app.get(StepsRepository));

    const [user] = await createUser({
      name: currentUser.name,
      provider: Provider.GOOGLE,
      subjectId: currentUser.subjectId,
    });

    const [target] = await createTarget({
      userId: user.id,
      title: 'Сдать экзамен',
      description: 'Закрыть все задачи и получить допуск',
      shouldBeCompletedAt: '2027-02-14',
    });

    const [firstStep] = await createStep({
      targetId: target.id,
      title: 'Купить продукты',
      description: 'Составить список и купить продукты',
      shouldBeCompletedAt: '2026-08-06',
    });

    const [secondStep] = await createStep({
      targetId: target.id,
      title: 'Закрыть кредит',
      description: '400к',
      shouldBeCompletedAt: '2026-08-08',
    });

    await request(app.getHttpServer())
      .get(`/targets/get-all-own`)
      .set('x-user-timezone', 'Europe/Moscow')
      .expect((res) => {
        expect(res.body).toEqual([
          {
            description: 'Закрыть все задачи и получить допуск',
            id: target.id,
            isOutdated: expect.any(Boolean),
            resultComment: null,
            rewards: [],
            shouldBeCompletedAt: '2027-02-14',
            status: 'created',
            steps: expect.arrayContaining([
              expect.objectContaining({
                id: firstStep.id,
                targetId: target.id,
                title: 'Купить продукты',
                description: 'Составить список и купить продукты',
                shouldBeCompletedAt: '2026-08-06',
                completedAt: null,
              }),
              expect.objectContaining({
                id: secondStep.id,
                targetId: target.id,
                title: 'Закрыть кредит',
                description: '400к',
                shouldBeCompletedAt: '2026-08-08',
                completedAt: null,
              }),
            ]),
            title: 'Сдать экзамен',
            userId: user.id,
          },
        ]);
      });
  });

  it('возвращается цель с несколькими наградами', async () => {
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
    const createRewardOnTarget = createRewardOnTargetFactory(
      app.get(RewardsRepository),
    );

    const [user] = await createUser({
      name: currentUser.name,
      provider: Provider.GOOGLE,
      subjectId: currentUser.subjectId,
    });

    const [target] = await createTarget({
      userId: user.id,
      title: 'Сдать экзамен',
      description: 'Закрыть все задачи и получить допуск',
      shouldBeCompletedAt: '2027-02-14',
    });

    const [senderUser] = await createUser({
      name: rewardSender.name,
      provider: Provider.GOOGLE,
      subjectId: rewardSender.subjectId,
    });

    const firstReward = await createRewardOnTarget({
      senderUserId: senderUser.id,
      targetId: target.id,
      title: 'Награда',
      description: 'Описание',
      type: RewardType.target,
    });

    const secondReward = await createRewardOnTarget({
      senderUserId: user.id,
      targetId: target.id,
      title: 'Награда',
      description: 'Описание',
      type: RewardType.target,
    });

    await request(app.getHttpServer())
      .get(`/targets/get-all-own`)
      .set('x-user-timezone', 'Europe/Moscow')
      .expect((res) => {
        expect(res.body).toEqual([
          {
            description: 'Закрыть все задачи и получить допуск',
            id: target.id,
            isOutdated: expect.any(Boolean),
            resultComment: null,
            rewards: expect.arrayContaining([
              expect.objectContaining({
                id: firstReward.id,
                recipientUserId: null,
                targetId: target.id,
                type: 'target',
                title: 'Награда',
                description: 'Описание',
                senderUserId: senderUser.id,
              }),
              expect.objectContaining({
                id: secondReward.id,
                recipientUserId: null,
                targetId: target.id,
                type: 'target',
                title: 'Награда',
                description: 'Описание',
                senderUserId: user.id,
              }),
            ]),
            shouldBeCompletedAt: '2027-02-14',
            status: 'created',
            steps: [],
            title: 'Сдать экзамен',
            userId: user.id,
          },
        ]);
      });
  });

  it('должен возвращать цель без дублирования шагов и наград (проверка отсутствия декартова произведения)', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule, RewardsModule],
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
    const createStep = createStepFactory(app.get(StepsRepository));
    const createRewardOnTarget = createRewardOnTargetFactory(
      app.get(RewardsRepository),
    );

    const [user] = await createUser({
      name: currentUser.name,
      provider: Provider.GOOGLE,
      subjectId: currentUser.subjectId,
    });

    const [senderUser] = await createUser({
      name: rewardSender.name,
      provider: Provider.GOOGLE,
      subjectId: rewardSender.subjectId,
    });

    const [target] = await createTarget({
      userId: user.id,
      title: 'Цель',
      description: 'Цель с двумя шагами и двумя наградами',
      shouldBeCompletedAt: '2027-02-14',
    });

    await createStep({
      targetId: target.id,
      title: 'Первый шаг',
      description: 'Описание первого шага',
      shouldBeCompletedAt: '2027-01-01',
    });
    await createStep({
      targetId: target.id,
      title: 'Второй шаг',
      description: 'Описание второго шага',
      shouldBeCompletedAt: '2027-01-02',
    });

    await createRewardOnTarget({
      senderUserId: user.id,
      targetId: target.id,
      title: 'Первая награда',
      description: 'Описание первой награды',
      type: RewardType.target,
    });
    await createRewardOnTarget({
      senderUserId: senderUser.id,
      targetId: target.id,
      title: 'Вторая награда',
      description: 'Описание второй награды',
      type: RewardType.target,
    });

    await request(app.getHttpServer())
      .get('/targets/get-all-own')
      .set('x-user-timezone', 'Europe/Moscow')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0].steps).toHaveLength(2);
        expect(body[0].rewards).toHaveLength(2);
      });
  });

  it.each([
    {
      name: 'цель просрочена',
      shouldBeCompletedAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
      expectedIsOutdated: true,
    },
    {
      name: 'цель не просрочена',
      shouldBeCompletedAt: dayjs().add(2, 'day').format('YYYY-MM-DD'),
      expectedIsOutdated: false,
    },
  ])('$name', async ({ shouldBeCompletedAt, expectedIsOutdated }) => {
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

    const [user] = await createUser({
      name: currentUser.name,
      provider: Provider.GOOGLE,
      subjectId: currentUser.subjectId,
    });

    await createTarget({
      userId: user.id,
      title: 'Цель',
      description: 'Проверка признака isOutdated',
      shouldBeCompletedAt,
    });

    await request(app.getHttpServer())
      .get('/targets/get-all-own')
      .set('x-user-timezone', 'Europe/Moscow')
      .expect(200)
      .expect(({ body }) => {
        expect(body[0].isOutdated).toBe(expectedIsOutdated);
      });
  });
});
