import { INestApplication } from '@nestjs/common';
import { setupTestDatabase } from './utils/setupTestDatabase';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { createTestingApp } from 'src/helpers/create-testing-app';
import { createUserFactory } from './factories/users.factory';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersRepository } from 'src/modules/users/users.repository';
import { Provider } from 'src/modules/users/users.types';
import request from 'supertest';
import { AUTH_MICROSERVICE } from 'src/modules/microservices/auth/tokens';
import { of } from 'rxjs';

describe('Users (e2e) - /GET users/get-all', () => {
  let app: INestApplication;

  const currentUser = {
    subjectId: '1',
    name: 'Test User',
  };

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  setupTestDatabase(['users']);

  it('возвращает всех пользователей кроме текущего', async () => {
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

    await createUser({
      name: currentUser.name,
      provider: Provider.GOOGLE,
      subjectId: currentUser.subjectId,
    });

    const [user] = await createUser({
      name: 'Ivan',
      provider: Provider.GOOGLE,
      subjectId: '2',
    });

    await request(app.getHttpServer())
      .get(`/users/get-all`)
      .set('x-user-timezone', 'Europe/Moscow')
      .expect((res) => {
        expect(res.body).toEqual([
          {
            id: user.id,
            createdAt: expect.any(String),
            fullName: user.full_name,
          },
        ]);
      });
  });
});
