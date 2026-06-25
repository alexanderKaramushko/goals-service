import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { CreateTargetDto } from 'src/modules/targets/targets.dto';
import { createTestingApp } from 'src/helpers/create-testing-app';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { execSync } from 'child_process';
import { clearTables } from './factories';
import { UsersModule } from 'src/modules/users/users.module';
import { createUserFactory } from './factories/users.factory';
import { Provider } from 'src/modules/users/users.types';
import { UsersRepository } from 'src/modules/users/users.repository';
import { getTargetFactory } from './factories/targets.factory';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { dayjs } from 'src/helpers/dayjs';

describe('Targets (e2e) – /POST targets/create', () => {
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

    if (postgresClient) {
      await clearTables(postgresClient, ['targets', 'users']);
    }
  });

  afterAll(async () => {
    jest.useRealTimers();

    await postgresClient?.end();
    await postgresContainer?.stop();
  });

  const valid: CreateTargetDto = {
    title: 'Test',
    description: 'Desc',
    shouldBeCompletedAt: '2020-01-02',
  };

  it.each<[string, CreateTargetDto, string]>([
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
  ])(
    '/POST targets/create\n\tВалидация параметра: %s\n',
    async (_, data, message) => {
      app = await createTestingApp({
        modules: [TargetsModule],
      });

      await request(app.getHttpServer())
        .post('/targets/create')
        .set({
          'x-user-timezone': 'America/Anchorage',
        })
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toContain(message);
        });
    },
  );

  it('/POST targets/create успешно создает цель', async () => {
    jest.useRealTimers();

    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const getTarget = getTargetFactory(app.get(TargetsRepository));

    const [user] = await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    let createdTargetId = 0;

    await request(app.getHttpServer())
      .post('/targets/create')
      .set({
        'x-user-timezone': 'America/Anchorage',
      })
      .send({
        ...valid,
        shouldBeCompletedAt: '2027-02-14',
      })
      .expect((res) => {
        expect(res.status).toBe(201);
        expect(res.body).toEqual([
          expect.objectContaining({
            id: expect.any(Number),
            userId: user.id,
            title: valid.title,
            description: valid.description,
            status: 'created',
            shouldBeCompletedAt: '2027-02-14',
          }),
        ]);

        createdTargetId = res.body[0].id;
      });

    const createdTarget = await getTarget({
      userId: user.id,
      targetId: createdTargetId,
    });

    expect(createdTarget).toEqual(
      expect.objectContaining({
        id: createdTargetId,
        user_id: user.id,
        title: valid.title,
        description: valid.description,
        status: 'created',
      }),
    );

    expect(createdTarget.should_be_completed_at).toBe('2027-02-14');
  });

  it.each<[string, number]>([
    ['текущий день', 0],
    ['прошедший день', 1],
  ])(
    'Ошибка валидации shouldBeCompletedAtDate, если передан %s',
    async (_, subtractDays) => {
      app = await createTestingApp({
        modules: [TargetsModule],
      });

      const shouldBeCompletedAt = dayjs(new Date())
        .tz('Europe/Moscow')
        .subtract(subtractDays, 'day')
        .format('YYYY-MM-DD');

      await request(app.getHttpServer())
        .post('/targets/create')
        .set({
          'x-user-timezone': 'Europe/Moscow',
        })
        .send({
          ...valid,
          shouldBeCompletedAt,
        })
        .expect((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe(
            'Дата окончания должна быть больше текущей даты',
          );
        });
    },
  );
});
