import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestingApp } from 'src/helpers/create-testing-app';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { execSync } from 'child_process';
import {
  clearTables,
  completeStepFactory,
  createStepFactory,
} from './factories';
import { UsersModule } from 'src/modules/users/users.module';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { createUserFactory } from './factories/users.factory';
import {
  createTargetFactory,
  getTargetFactory,
  setTargetStatusFactory,
} from './factories/targets.factory';
import { UsersRepository } from 'src/modules/users/users.repository';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { StepsRepository } from 'src/modules/steps/steps.repository';
import { dayjs } from 'src/helpers/dayjs';
import { TargetStatus } from 'src/modules/targets/targets.types';
import { Provider } from 'src/modules/users/users.types';
import { CompleteTargetDto } from 'src/modules/targets/targets.dto';
import { StepsModule } from 'src/modules/steps/steps.module';
import { TargetNotFoundException } from 'src/modules/targets/exceptions/target-not-found.exception';
import { TargetNotInStatusException } from 'src/modules/targets/exceptions/target-not-in-status.exception';
import { TargetDeadlineOutdatedException } from 'src/modules/targets/exceptions/target-deadline-outdated';
import { TargetHasUncompletedStepsException } from 'src/modules/targets/exceptions/target-has-uncompleted-steps.exception';

describe('Steps (e2e) - /PUT targets/complete/:targetId', () => {
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

  const valid: CompleteTargetDto = {
    resultComment: 'Сдал на права',
  };

  it('Валидация :targetId', async () => {
    app = await createTestingApp({
      modules: [TargetsModule],
    });

    await request(app.getHttpServer())
      .put('/targets/complete/wrongId')
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

  it.each<[string, CompleteTargetDto, string]>([
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
      modules: [TargetsModule],
    });

    await request(app.getHttpServer())
      .put('/targets/complete/1')
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send(data)
      .expect((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toContain(message);
      });
  });

  it('успешно завершает активную цель с завершенным шагом', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const getTarget = getTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));
    const completeStep = completeStepFactory(app.get(StepsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(TargetsRepository));

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

    await completeStep({
      stepId: step.id,
      resultComment: 'Составил план питания',
    });

    await request(app.getHttpServer())
      .put(`/targets/complete/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        resultComment: 'Составил план питания',
      })
      .expect((res) => {
        expect(res.body.message).not.toBeDefined();
        expect(res.status).toBe(200);
        expect(res.body.completedAt).toBe(dayjs().format('YYYY-MM-DD'));
      });

    const completedTarget = await getTarget({
      userId: user.id,
      targetId: target.id,
    });

    expect(completedTarget).toEqual(
      expect.objectContaining({
        completed_at: dayjs().format('YYYY-MM-DD'),
        status: 'completed',
        result_comment: 'Составил план питания',
      }),
    );
  });

  it('ошибка, если есть незавершенный шаг', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(TargetsRepository));

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

    await request(app.getHttpServer())
      .put(`/targets/complete/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        resultComment: 'Составил план питания',
      })
      .expect((res) => {
        const error = new TargetHasUncompletedStepsException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it('успешно завершает активную цель с просроченными шагами', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const getTarget = getTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(TargetsRepository));

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
      shouldBeCompletedAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    });

    await request(app.getHttpServer())
      .put(`/targets/complete/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        resultComment: 'Составил план питания',
      })
      .expect((res) => {
        expect(res.body.message).not.toBeDefined();
        expect(res.status).toBe(200);
        expect(res.body.completedAt).toBe(dayjs().format('YYYY-MM-DD'));
      });

    const completedTarget = await getTarget({
      userId: user.id,
      targetId: target.id,
    });

    expect(completedTarget).toEqual(
      expect.objectContaining({
        completed_at: dayjs().format('YYYY-MM-DD'),
        status: 'completed',
        result_comment: 'Составил план питания',
      }),
    );
  });

  it('ошибка, если цель не найдена', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));

    await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    await request(app.getHttpServer())
      .put(`/targets/complete/12345`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        resultComment: 'Составил план питания',
      })
      .expect((res) => {
        const error = new TargetNotFoundException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it('ошибка, если завершается неактивная цель', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));

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

    await request(app.getHttpServer())
      .put(`/targets/complete/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        resultComment: 'Составил план питания',
      })
      .expect((res) => {
        const error = new TargetNotInStatusException(TargetStatus.Active);

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it('ошибка, если завершается просроченная цель', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(TargetsRepository));

    await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: '1',
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    });

    await setTargetStatus(target.id, TargetStatus.Active);

    await request(app.getHttpServer())
      .put(`/targets/complete/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        resultComment: 'Составил план питания',
      })
      .expect((res) => {
        const error = new TargetDeadlineOutdatedException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });
});
