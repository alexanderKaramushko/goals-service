import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { StepsModule } from 'src/modules/steps/steps.module';
import { CompleteStepDto } from 'src/modules/steps/steps.dto';
import { createTestingApp } from 'src/helpers/create-testing-app';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { execSync } from 'child_process';
import {
  clearTables,
  createStepFactory,
  getStepFactory,
  setTargetStatusFactory,
} from './factories';
import { UsersModule } from 'src/modules/users/users.module';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { createUserFactory } from './factories/users.factory';
import { createTargetFactory } from './factories/targets.factory';
import { UsersRepository } from 'src/modules/users/users.repository';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { StepsRepository } from 'src/modules/steps/steps.repository';
import { DbService } from 'src/modules/db/db.service';
import dayjs from 'dayjs';
import { StepNotFoundException } from 'src/modules/steps/exceptions/step-not-found.exception';
import { TargetStatus } from 'src/modules/targets/targets.types';
import { TargetNotActiveException } from 'src/modules/steps/exceptions/target-not-active.exception';
import { StepAlreadyCompletedException } from 'src/modules/steps/exceptions/step-already-completed.exception';
import { StepDeadlineOutdatedException } from 'src/modules/steps/exceptions/step-deadline-outdated';
import { StepDeadlineNotClosestException } from 'src/modules/steps/exceptions/step-deadline-not-closest';
import { Provider } from 'src/modules/users/users.types';

describe('Steps (e2e) - /POST steps/complete/:stepId', () => {
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

    await clearTables(postgresClient, ['steps']);
  });

  afterAll(async () => {
    await postgresClient?.end();
    await postgresContainer?.stop();
  });

  const valid: CompleteStepDto = {
    resultComment: 'Посмотрел видео по правильному питанию',
  };

  it('Валидация :stepId', async () => {
    app = await createTestingApp({
      modules: [StepsModule],
    });

    await request(app.getHttpServer())
      .post('/steps/complete/wrongId')
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

  it.each<[string, CompleteStepDto, string]>([
    [
      'resultComment',
      {
        ...valid,
        resultComment: '',
      },
      'resultComment should not be empty',
    ],
    [
      'resultComment',
      {
        ...valid,
        // проверяем валидацию на строку
        resultComment: 123 as unknown as string,
      },
      'resultComment must be a string',
    ],
  ])('Валидация параметра: %s\n', async (_, data, message) => {
    app = await createTestingApp({
      modules: [StepsModule],
    });

    await request(app.getHttpServer())
      .post('/steps/complete/1')
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send(data)
      .expect((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toContain(message);
      });
  });

  it('успешно завершает шаг на активной цели', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));
    const getStep = getStepFactory(app.get(StepsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(DbService));

    const [user] = await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: '1',
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    });

    await setTargetStatus(target.id, TargetStatus.Active);

    const [step] = await createStep({
      targetId: target.id,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    });

    await request(app.getHttpServer())
      .post(`/steps/complete/${step.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        stepId: step.id,
        resultComment: 'Посмотрел видео по правильному питанию',
      })
      .expect((res) => {
        expect(res.status).toBe(201);
        expect(res.body.message).not.toBeDefined();
        expect(res.body.completedAt).toBe(dayjs().format('YYYY-MM-DD'));
      });

    const completedStep = await getStep({
      stepId: step.id,
      userId: user.id,
    });

    expect(completedStep).toEqual(
      expect.objectContaining({
        completed_at: dayjs().format('YYYY-MM-DD'),
        result_comment: 'Посмотрел видео по правильному питанию',
      }),
    );
  });

  it('ошибка, если шаг не существует', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(DbService));

    await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: '1',
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    });

    await setTargetStatus(target.id, TargetStatus.Active);

    await request(app.getHttpServer())
      .post(`/steps/complete/12345`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        stepId: 999,
        resultComment: 'Посмотрел видео по правильному питанию',
      })
      .expect((res) => {
        expect(res.body.message).toBe(new StepNotFoundException().message);
        expect(res.status).toBe(404);
      });
  });

  it.each<[TargetStatus, string]>([
    [TargetStatus.Created, new TargetNotActiveException().message],
    [TargetStatus.Cancelled, new TargetNotActiveException().message],
    [TargetStatus.Completed, new TargetNotActiveException().message],
  ])(
    'Ошибка при завершении шага у цели в статусе %s\n',
    async (status, message) => {
      app = await createTestingApp(
        {
          modules: [UsersModule, TargetsModule, StepsModule],
        },
        { useRealDbService: true },
      );

      const createUser = createUserFactory(app.get(UsersRepository));
      const createTarget = createTargetFactory(app.get(TargetsRepository));
      const createStep = createStepFactory(app.get(StepsRepository));
      const setTargetStatus = setTargetStatusFactory(app.get(DbService));

      await createUser({
        name: 'Test User',
        provider: Provider.GOOGLE,
        subjectId: '1',
      });

      const [target] = await createTarget({
        userId: '1',
        title: 'Составить план питания',
        description: 'Расписать план питания и составить список продуктов',
        shouldBeCompletedAt: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      });

      await setTargetStatus(target.id, status);

      const [step] = await createStep({
        targetId: target.id,
        title: 'Составить план питания',
        description: 'Расписать план питания и составить список продуктов',
        shouldBeCompletedAt: dayjs().add(2, 'day').format('YYYY-MM-DD'),
      });

      await request(app.getHttpServer())
        .post(`/steps/complete/${step.id}`)
        .set({
          'x-user-timezone': 'Europe/Moscow',
        })
        .send({
          stepId: step.id,
          resultComment: 'Посмотрел видео по правильному питанию',
        })
        .expect((res) => {
          expect(res.body.message).toBe(message);
          expect(res.status).toBe(409);
        });
    },
  );

  it('ошибка при повторном завершении шага', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(DbService));

    await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: '1',
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    });

    await setTargetStatus(target.id, TargetStatus.Active);

    const [step] = await createStep({
      targetId: target.id,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    });

    await request(app.getHttpServer())
      .post(`/steps/complete/${step.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        stepId: step.id,
        resultComment: 'Посмотрел видео по правильному питанию',
      })
      .expect((res) => {
        expect(res.status).toBe(201);
        expect(res.body.message).not.toBeDefined();
        expect(res.body.completedAt).toBe(dayjs().format('YYYY-MM-DD'));
      });

    await request(app.getHttpServer())
      .post(`/steps/complete/${step.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        stepId: step.id,
        resultComment: 'Посмотрел видео по правильному питанию',
      })
      .expect((res) => {
        expect(res.body.message).toBe(
          new StepAlreadyCompletedException().message,
        );
        expect(res.status).toBe(409);
      });
  });

  it('два параллельных запроса на завершение одного шага: успешен только один', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(DbService));

    await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: '1',
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    });

    await setTargetStatus(target.id, TargetStatus.Active);

    const [step] = await createStep({
      targetId: target.id,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    });

    const payload = {
      resultComment: 'Посмотрел видео по правильному питанию',
    };

    const [firstResponse, secondResponse] = await Promise.all([
      request(app.getHttpServer())
        .post(`/steps/complete/${step.id}`)
        .set({
          'x-user-timezone': 'Europe/Moscow',
        })
        .send(payload),
      request(app.getHttpServer())
        .post(`/steps/complete/${step.id}`)
        .set({
          'x-user-timezone': 'Europe/Moscow',
        })
        .send(payload),
    ]);

    const statuses = [firstResponse.status, secondResponse.status].sort(
      (a, b) => a - b,
    );

    expect(statuses).toEqual([201, 409]);

    const conflictResponse = [firstResponse, secondResponse].find(
      (response) => response.status === 409,
    );

    expect(conflictResponse?.body.message).toBe(
      new StepAlreadyCompletedException().message,
    );
  });

  it('ошибка, если дедлайн уже прошел', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(DbService));

    await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: '1',
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    });

    await setTargetStatus(target.id, TargetStatus.Active);

    const [step] = await createStep({
      targetId: target.id,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    });

    await request(app.getHttpServer())
      .post(`/steps/complete/${step.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        stepId: step.id,
        resultComment: 'Посмотрел видео по правильному питанию',
      })
      .expect((res) => {
        expect(res.body.message).toBe(
          new StepDeadlineOutdatedException().message,
        );
        expect(res.status).toBe(409);
      });
  });

  it('ошибка, если завершается не самый ранний шаг', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(DbService));

    await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: '1',
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    });

    await setTargetStatus(target.id, TargetStatus.Active);

    await createStep({
      targetId: target.id,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    });

    const [step] = await createStep({
      targetId: target.id,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(4, 'day').format('YYYY-MM-DD'),
    });

    await request(app.getHttpServer())
      .post(`/steps/complete/${step.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        stepId: step.id,
        resultComment: 'Посмотрел видео по правильному питанию',
      })
      .expect((res) => {
        expect(res.body.message).toBe(
          new StepDeadlineNotClosestException().message,
        );
        expect(res.status).toBe(409);
      });
  });

  it('[edge case] успешно завершается ближайший не просроченный шаг', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));
    const getStep = getStepFactory(app.get(StepsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(DbService));

    const [user] = await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: '1',
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    });

    await setTargetStatus(target.id, TargetStatus.Active);

    await createStep({
      targetId: target.id,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    });

    const [step] = await createStep({
      targetId: target.id,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    });

    await request(app.getHttpServer())
      .post(`/steps/complete/${step.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        stepId: step.id,
        resultComment: 'Посмотрел видео по правильному питанию',
      })
      .expect((res) => {
        expect(res.status).toBe(201);
        expect(res.body.message).not.toBeDefined();
        expect(res.body.completedAt).toBe(dayjs().format('YYYY-MM-DD'));
      });

    const completedStep = await getStep({
      stepId: step.id,
      userId: user.id,
    });

    expect(completedStep).toEqual(
      expect.objectContaining({
        completed_at: dayjs().format('YYYY-MM-DD'),
        result_comment: 'Посмотрел видео по правильному питанию',
      }),
    );
  });
});
