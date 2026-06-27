import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestingApp } from 'src/helpers/create-testing-app';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { execSync } from 'child_process';
import { clearTables, createStepFactory } from './factories';
import { UsersModule } from 'src/modules/users/users.module';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { StepsModule } from 'src/modules/steps/steps.module';
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
import { TargetNotFoundException } from 'src/modules/targets/exceptions/target-not-found.exception';
import { TargetNotInStatusException } from 'src/modules/targets/exceptions/target-not-in-status.exception';

describe('Targets (e2e) - /POST targets/delete/:targetId', () => {
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

    await clearTables(postgresClient, ['targets', 'users']);
  });

  afterAll(async () => {
    await postgresClient?.end();
    await postgresContainer?.stop();
  });

  it('Валидация :targetId', async () => {
    app = await createTestingApp({
      modules: [TargetsModule],
    });

    await request(app.getHttpServer())
      .post('/targets/delete/wrongId')
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .expect((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toContain(
          'Validation failed (numeric string is expected)',
        );
      });
  });

  it('успешно удаляет не запущенную цель вместе со шагами', async () => {
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

    const [user] = await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: user.id,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    });

    const [step] = await createStep({
      targetId: target.id,
      title: 'Купить продукты',
      description: 'Составить список и купить продукты',
      shouldBeCompletedAt: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    });

    await request(app.getHttpServer())
      .post(`/targets/delete/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .expect((res) => {
        expect(res.body.message).not.toBeDefined();
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ id: target.id });
      });

    const deletedTarget = await getTarget({
      userId: user.id,
      targetId: target.id,
    });

    expect(deletedTarget).toBeUndefined();

    const deletedStep = await postgresClient.query<{ id: number }>(
      `
        SELECT s.id
        FROM steps s
        WHERE s.id = $1
      `,
      [step.id],
    );

    expect(deletedStep.rows).toHaveLength(0);
  });

  it('ошибка, если цель не найдена', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule],
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
      .post('/targets/delete/12345')
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .expect((res) => {
        const error = new TargetNotFoundException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it('ошибка, если цель принадлежит другому пользователю', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule],
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

    await createUser({
      name: 'Another User',
      provider: Provider.GOOGLE,
      subjectId: '2',
    });

    const [target] = await createTarget({
      userId: '2',
      title: 'Чужая цель',
      description: 'Эту цель создал другой пользователь',
      shouldBeCompletedAt: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    });

    await request(app.getHttpServer())
      .post(`/targets/delete/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .expect((res) => {
        const error = new TargetNotFoundException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it.each<[TargetStatus]>([
    [TargetStatus.Active],
    [TargetStatus.Completed],
    [TargetStatus.Cancelled],
  ])('ошибка, если цель в статусе %s', async (status) => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule],
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
      shouldBeCompletedAt: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    });

    await setTargetStatus(target.id, status);

    await request(app.getHttpServer())
      .post(`/targets/delete/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .expect((res) => {
        const error = new TargetNotInStatusException(TargetStatus.Created);

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it('ошибка, если цель уже была удалена', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule],
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
      shouldBeCompletedAt: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    });

    await request(app.getHttpServer())
      .post(`/targets/delete/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/targets/delete/${target.id}`)
      .set({
        'x-user-timezone': 'Europe/Moscow',
      })
      .expect((res) => {
        const error = new TargetNotFoundException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });
});
