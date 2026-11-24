import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { of } from 'rxjs';
import { createTestingApp } from 'src/helpers/create-testing-app';
import { AUTH_MICROSERVICE } from 'src/modules/microservices/auth/tokens';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { TargetRaw } from 'src/modules/targets/targets.types';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersRepository } from 'src/modules/users/users.repository';
import { Provider } from 'src/modules/users/users.types';
import { createTargetFactory } from './factories';
import { createUserFactory } from './factories/users.factory';
import { setupTestDatabase } from './utils/setupTestDatabase';

describe('Targets (e2e) - курсорная пагинация /GET targets/get-all-own', () => {
  let app: INestApplication;
  let targets: TargetRaw[];

  const currentUser = { subjectId: '1', name: 'Test User' };

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  const database = setupTestDatabase(['targets', 'users']);

  beforeEach(async () => {
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

    targets = [];

    // Порядок дат отличается от порядка ID, чтобы проверить сортировку по дате.
    for (const day of ['03', '01', '05', '02', '04']) {
      const [target] = await createTarget({
        userId: user.id,
        title: `Цель за ${day} января`,
        description: 'Проверка курсорной пагинации',
        shouldBeCompletedAt: '2027-02-14',
      });

      await database.postgresClient!.query(
        'UPDATE targets SET created_at = $1 WHERE id = $2',
        [`2026-01-${day}T00:00:00.000Z`, target.id],
      );

      targets.push(target);
    }
  });

  it('возвращает первую страницу без передачи курсора', async () => {
    await request(app.getHttpServer())
      .get('/targets/get-all-own')
      .query({ limit: 2 })
      .set('x-user-timezone', 'Europe/Moscow')
      .expect(200)
      .expect(({ body }) => {
        expect(body.pages.map((target: { id: number }) => target.id)).toEqual([
          targets[2].id,
          targets[4].id,
        ]);
        expect(body.pageInfo).toEqual({
          hasNextPage: true,
          paginationCursor: expect.any(String),
        });
      });
  });

  it('возвращает вторую страницу по курсору первой страницы', async () => {
    const firstPage = await request(app.getHttpServer())
      .get('/targets/get-all-own')
      .query({ limit: 2 })
      .set('x-user-timezone', 'Europe/Moscow')
      .expect(200);

    await request(app.getHttpServer())
      .get('/targets/get-all-own')
      .query({
        limit: 2,
        paginationCursor: firstPage.body.pageInfo.paginationCursor,
      })
      .set('x-user-timezone', 'Europe/Moscow')
      .expect(200)
      .expect(({ body }) => {
        expect(body.pages.map((target: { id: number }) => target.id)).toEqual([
          targets[0].id,
          targets[3].id,
        ]);
        expect(body.pageInfo).toEqual({
          hasNextPage: true,
          paginationCursor: expect.any(String),
        });
      });
  });

  it('возвращает последнюю страницу с остатком записей', async () => {
    const firstPage = await request(app.getHttpServer())
      .get('/targets/get-all-own')
      .query({ limit: 2 })
      .set('x-user-timezone', 'Europe/Moscow')
      .expect(200);

    const secondPage = await request(app.getHttpServer())
      .get('/targets/get-all-own')
      .query({
        limit: 2,
        paginationCursor: firstPage.body.pageInfo.paginationCursor,
      })
      .set('x-user-timezone', 'Europe/Moscow')
      .expect(200);

    await request(app.getHttpServer())
      .get('/targets/get-all-own')
      .query({
        limit: 2,
        paginationCursor: secondPage.body.pageInfo.paginationCursor,
      })
      .set('x-user-timezone', 'Europe/Moscow')
      .expect(200)
      .expect(({ body }) => {
        expect(body.pages.map((target: { id: number }) => target.id)).toEqual([
          targets[1].id,
        ]);
        expect(body.pageInfo).toEqual({
          hasNextPage: false,
          paginationCursor: expect.any(String),
        });
      });
  });

  it('возвращает hasNextPage false для полностью заполненной последней страницы', async () => {
    await database.postgresClient!.query('DELETE FROM targets WHERE id = $1', [
      targets[1].id,
    ]);

    const firstPage = await request(app.getHttpServer())
      .get('/targets/get-all-own')
      .query({ limit: 2 })
      .set('x-user-timezone', 'Europe/Moscow')
      .expect(200);

    await request(app.getHttpServer())
      .get('/targets/get-all-own')
      .query({
        limit: 2,
        paginationCursor: firstPage.body.pageInfo.paginationCursor,
      })
      .set('x-user-timezone', 'Europe/Moscow')
      .expect(200)
      .expect(({ body }) => {
        expect(body.pages.map((target: { id: number }) => target.id)).toEqual([
          targets[0].id,
          targets[3].id,
        ]);
        expect(body.pageInfo).toEqual({
          hasNextPage: false,
          paginationCursor: expect.any(String),
        });
      });
  });
});
