import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { StepsModule } from 'src/modules/steps/steps.module';
import { CreateStepDto } from 'src/modules/steps/steps.dto';
import { createTestingApp } from 'src/helpers/create-testing-app';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { execSync } from 'child_process';
import { clearTables, getStepFactory } from './factories';
import { createTargetFactory } from './factories/targets.factory';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { UsersRepository } from 'src/modules/users/users.repository';
import { createUserFactory } from './factories/users.factory';
import { UsersModule } from 'src/modules/users/users.module';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { StepsRepository } from 'src/modules/steps/steps.repository';
import { StepWithSameDeadlineExistsException } from 'src/modules/steps/exceptions/step-with-same-deadline-exists.exception';
import { StepDeadlineOutdatedException } from 'src/modules/steps/exceptions/step-deadline-outdated';
import { Provider } from 'src/modules/users/users.types';
import { dayjs } from 'src/helpers/dayjs';

describe('Steps (e2e) - /POST steps/create', () => {
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

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2020, 0, 1));
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }

    await clearTables(postgresClient, ['steps']);
  });

  afterAll(async () => {
    jest.useRealTimers();

    await postgresClient?.end();
    await postgresContainer?.stop();
  });

  const valid: CreateStepDto = {
    title: 'Test',
    description: 'Desc',
    shouldBeCompletedAt: '2022-01-01T00:00:00.000Z',
  };

  it('Валидация :targetId', async () => {
    app = await createTestingApp({
      modules: [StepsModule],
    });

    await request(app.getHttpServer())
      .post('/steps/create/wrongId')
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

  it.each<[string, CreateStepDto, string]>([
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
      'shouldBeCompletedAt',
      {
        ...valid,
        shouldBeCompletedAt: '',
      },
      'shouldBeCompletedAt should not be empty',
    ],
    [
      'shouldBeCompletedAt',
      {
        ...valid,
        shouldBeCompletedAt: 'not-a-timezone',
      },
      'shouldBeCompletedAt must be a valid ISO 8601 date string',
    ],
  ])('Валидация параметра: %s\n', async (_, data, message) => {
    app = await createTestingApp({
      modules: [StepsModule],
    });

    await request(app.getHttpServer())
      .post('/steps/create/1')
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send(data)
      .expect((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toContain(message);
      });
  });

  it('успешно создает шаг', async () => {
    jest.useRealTimers();

    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const getStep = getStepFactory(app.get(StepsRepository));

    const [user] = await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: user.id,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: '2027-02-14',
    });

    let createdStepId = 0;

    await request(app.getHttpServer())
      .post(`/steps/create/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        ...valid,
        shouldBeCompletedAt: '2027-02-15T00:00:00.000Z',
      })
      .expect((res) => {
        expect(res.status).toBe(201);
        expect(res.body).toEqual([
          expect.objectContaining({
            id: expect.any(Number),
            targetId: target.id,
            title: valid.title,
            description: valid.description,
            shouldBeCompletedAt: '2027-02-15',
            closed_at: null,
            completed_at: null,
          }),
        ]);
        expect(dayjs(res.body[0].created_at).format('YYYY-MM-DD')).toBe(
          dayjs().format('YYYY-MM-DD'),
        );

        createdStepId = res.body[0].id;
      });

    const createdStep = await getStep({
      stepId: createdStepId,
      userId: user.id,
    });

    expect(createdStep).toEqual(
      expect.objectContaining({
        id: createdStepId,
        target_id: target.id,
        title: valid.title,
        description: valid.description,
        completed_at: null,
        result_comment: null,
      }),
    );
    expect(createdStep?.should_be_completed_at).toBe('2027-02-15');
  });

  it.each<[string, number]>([
    ['текущий день', 0],
    ['прошедший день', 1],
  ])(
    'Ошибка валидации shouldBeCompletedAtDate, если для шага передан %s',
    async (_, subtractDays) => {
      app = await createTestingApp({
        modules: [StepsModule],
      });

      const shouldBeCompletedAt = dayjs(new Date())
        .tz('Europe/Moscow')
        .subtract(subtractDays, 'day')
        .format('YYYY-MM-DD');

      await request(app.getHttpServer())
        .post('/steps/create/1')
        .set({
          'x-user-timezone': 'Europe/Moscow',
        })
        .send({
          ...valid,
          shouldBeCompletedAt,
        })
        .expect((res) => {
          const error = new StepDeadlineOutdatedException();

          expect(res.status).toBe(error.getStatus());
          expect(res.body.message).toBe(error.message);
        });
    },
  );

  it('Ошибка валидации, если есть шаг с одинаковым shouldBeCompletedAt', async () => {
    jest.useRealTimers();

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
      shouldBeCompletedAt: '2026-02-14',
    });

    await request(app.getHttpServer())
      .post(`/steps/create/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        title: 'Рецепты для плана питания',
        description:
          'Найти рецепты для планов питания и составить список продуктов',
        shouldBeCompletedAt: '2027-02-15T06:45:30.000Z',
      })
      .expect((res) => {
        expect(res.status).toBe(201);
      });

    await request(app.getHttpServer())
      .post(`/steps/create/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .send({
        title: 'Рецепты для плана питания',
        description:
          'Найти рецепты для планов питания и составить список продуктов',
        shouldBeCompletedAt: '2027-02-15T06:45:30.000Z',
      })
      .expect((res) => {
        const error = new StepWithSameDeadlineExistsException('2027-02-15');

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });
});
