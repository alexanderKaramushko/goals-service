import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { CreateRewardOnTargetDto } from 'src/modules/rewards/rewards.dto';
import { RewardsModule } from 'src/modules/rewards/rewards.module';
import { createTestingApp } from 'src/helpers/create-testing-app';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { execSync } from 'child_process';
import {
  clearTables,
  createRewardOnTargetFactory,
  getRewardsOnTargetBySenderUserIdFactory,
} from './factories';
import { UsersModule } from 'src/modules/users/users.module';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { createUserFactory } from './factories/users.factory';
import {
  completeTargetFactory,
  createTargetFactory,
} from './factories/targets.factory';
import { UsersRepository } from 'src/modules/users/users.repository';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { Provider } from 'src/modules/users/users.types';
import { RewardsRepository } from 'src/modules/rewards/rewards.repository';
import { RewardType } from 'src/modules/rewards/rewards.types';
import { TargetNotFoundException } from 'src/modules/targets/exceptions/target-not-found.exception';
import { RewardOnOwnTargetException } from 'src/modules/rewards/exceptions/reward-on-own-target.exception';
import { RewardOnUncompletedTargetException } from 'src/modules/rewards/exceptions/reward-on-uncompleted-target.exception';
import { RewardUnassignableException } from 'src/modules/rewards/exceptions/reward-unassignable.exception';
import { RewardAlreadyAssignedException } from 'src/modules/rewards/exceptions/reward-already-assigned.exception';
import { dayjs } from 'src/helpers/dayjs';

describe('Rewards (e2e) – /POST rewards/create/:targetId', () => {
  jest.setTimeout(60000);

  let app: INestApplication;
  let postgresContainer: StartedPostgreSqlContainer;
  let postgresClient: Client;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer(
      'postgres:17-alpine',
    ).start();

    postgresClient = new Client({
      connectionString: postgresContainer.getConnectionUri(),
    });

    process.env.DATABASE_URL = postgresContainer.getConnectionUri();

    await postgresClient.connect();

    execSync('pnpm run migrate:init', {
      env: {
        ...process.env,
        DATABASE_URL: postgresContainer.getConnectionUri(),
      },
    });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }

    if (postgresClient) {
      await clearTables(postgresClient, [
        'rewards',
        'steps',
        'targets',
        'users',
      ]);
    }
  });

  afterAll(async () => {
    await postgresClient?.end();
    await postgresContainer?.stop();
  });

  const valid: CreateRewardOnTargetDto = {
    title: 'Test',
    description: 'Desc',
  };

  it('Валидация :targetId', async () => {
    app = await createTestingApp({
      modules: [RewardsModule],
    });

    await request(app.getHttpServer())
      .post('/rewards/create/wrongId')
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send(valid)
      .expect((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toContain(
          'Validation failed (numeric string is expected)',
        );
      });
  });

  it.each<[string, CreateRewardOnTargetDto, string]>([
    [
      'title',
      {
        ...valid,
        title: '',
      },
      'title should not be empty',
    ],
    [
      'description',
      {
        ...valid,
        description: '',
      },
      'description should not be empty',
    ],
    [
      'title',
      {
        ...valid,
        title: 123 as unknown as string,
      },
      'title must be a string',
    ],
    [
      'description',
      {
        ...valid,
        description: 123 as unknown as string,
      },
      'description must be a string',
    ],
  ])(
    '/POST rewards/create\n\tВалидация параметра: %s\n',
    async (_, data, message) => {
      app = await createTestingApp({
        modules: [RewardsModule],
      });

      await request(app.getHttpServer())
        .post('/rewards/create/1')
        .set({
          'x-user-timezone': 'Europe/Moscow',
        })
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toContain(message);
        });
    },
  );

  it('успешно создает награду на завершенную цель другого пользователя', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, RewardsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const completeTarget = completeTargetFactory(app.get(TargetsRepository));
    const getRewardsOnTargetBySenderUserId =
      getRewardsOnTargetBySenderUserIdFactory(app.get(RewardsRepository));

    await createUser({
      name: 'Reward Sender',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [targetOwner] = await createUser({
      name: 'Target Owner',
      provider: Provider.GOOGLE,
      subjectId: '2',
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

    let createdRewardId = 0;

    await request(app.getHttpServer())
      .post(`/rewards/create/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        title: 'Билет в кино',
        description: 'За успешное завершение цели',
      })
      .expect((res) => {
        expect(res.status).toBe(201);
        expect(res.body).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            targetId: target.id,
            title: 'Билет в кино',
            description: 'За успешное завершение цели',
            type: RewardType.target,
            acceptedAt: null,
          }),
        );
        expect(dayjs(res.body.createdAt).format('YYYY-MM-DD')).toBe(
          dayjs().format('YYYY-MM-DD'),
        );

        createdRewardId = res.body.id;
      });

    const [createdReward] = await getRewardsOnTargetBySenderUserId({
      senderUserId: '1',
      targetId: target.id,
    });

    expect(createdReward).toEqual(
      expect.objectContaining({
        id: createdRewardId,
        sender_user_id: '1',
        target_id: target.id,
        title: 'Билет в кино',
        description: 'За успешное завершение цели',
        type: RewardType.target,
        accepted_at: null,
      }),
    );
  });

  it('ошибка, если цель не найдена', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, RewardsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));

    await createUser({
      name: 'Reward Sender',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    await request(app.getHttpServer())
      .post('/rewards/create/12345')
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send(valid)
      .expect((res) => {
        const error = new TargetNotFoundException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it('ошибка, если награда назначается на свою цель', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, RewardsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const completeTarget = completeTargetFactory(app.get(TargetsRepository));

    await createUser({
      name: 'Reward Sender',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: '1',
      title: 'Сдать экзамен',
      description: 'Закрыть все задачи и получить допуск',
      shouldBeCompletedAt: '2027-02-14',
    });

    await completeTarget({
      targetId: target.id,
      canAssignReward: true,
      resultComment: 'Экзамен сдан',
    });

    await request(app.getHttpServer())
      .post(`/rewards/create/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send(valid)
      .expect((res) => {
        const error = new RewardOnOwnTargetException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it('ошибка, если цель не завершена', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, RewardsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));

    await createUser({
      name: 'Reward Sender',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [targetOwner] = await createUser({
      name: 'Target Owner',
      provider: Provider.GOOGLE,
      subjectId: '2',
    });

    const [target] = await createTarget({
      userId: targetOwner.id,
      title: 'Сдать экзамен',
      description: 'Закрыть все задачи и получить допуск',
      shouldBeCompletedAt: '2027-02-14',
    });

    await request(app.getHttpServer())
      .post(`/rewards/create/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send(valid)
      .expect((res) => {
        const error = new RewardOnUncompletedTargetException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it('ошибка, если на цель нельзя назначить награду', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, RewardsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const completeTarget = completeTargetFactory(app.get(TargetsRepository));

    await createUser({
      name: 'Reward Sender',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [targetOwner] = await createUser({
      name: 'Target Owner',
      provider: Provider.GOOGLE,
      subjectId: '2',
    });

    const [target] = await createTarget({
      userId: targetOwner.id,
      title: 'Сдать экзамен',
      description: 'Закрыть все задачи и получить допуск',
      shouldBeCompletedAt: '2027-02-14',
    });

    await completeTarget({
      targetId: target.id,
      canAssignReward: false,
      resultComment: 'Экзамен сдан с просрочками',
    });

    await request(app.getHttpServer())
      .post(`/rewards/create/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send(valid)
      .expect((res) => {
        const error = new RewardUnassignableException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it('ошибка, если отправитель уже назначил награду на эту цель', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, RewardsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const completeTarget = completeTargetFactory(app.get(TargetsRepository));
    const createRewardOnTarget = createRewardOnTargetFactory(
      app.get(RewardsRepository),
    );
    const getRewardsOnTargetBySenderUserId =
      getRewardsOnTargetBySenderUserIdFactory(app.get(RewardsRepository));

    await createUser({
      name: 'Reward Sender',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [targetOwner] = await createUser({
      name: 'Target Owner',
      provider: Provider.GOOGLE,
      subjectId: '2',
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
      senderUserId: '1',
      targetId: target.id,
      title: valid.title,
      description: valid.description,
      type: RewardType.target,
    });

    await request(app.getHttpServer())
      .post(`/rewards/create/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send(valid)
      .expect((res) => {
        const error = new RewardAlreadyAssignedException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });

    const createdRewards = await getRewardsOnTargetBySenderUserId({
      senderUserId: '1',
      targetId: target.id,
    });

    expect(createdRewards).toHaveLength(1);
  });
});
