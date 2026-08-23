import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp } from 'src/helpers/create-testing-app';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersRepository } from 'src/modules/users/users.repository';
import { Provider } from 'src/modules/users/users.types';
import { createUserFactory } from './factories/users.factory';
import { setupTestDatabase } from './utils/setupTestDatabase';

describe('Users (e2e) - GET users/:userId', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  setupTestDatabase(['users']);

  it('возвращает пользователя', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));

    const [user] = await createUser({
      name: 'Ivan',
      provider: Provider.GOOGLE,
      subjectId: '2',
    });

    await request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          id: user.id,
          createdAt: expect.any(String),
          fullName: user.full_name,
        });
      });
  });

  it('возвращает 404, если пользователь не существует', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule],
      },
      { useRealDbService: true },
    );

    await request(app.getHttpServer())
      .get('/users/999')
      .expect((res) => {
        expect(res.status).toBe(404);
        expect(res.body).toEqual({
          error: 'Not Found',
          message: 'Пользователь не найден',
          statusCode: 404,
        });
      });
  });

  it('возвращает 400 для некорректного id', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule],
      },
      { useRealDbService: true },
    );

    await request(app.getHttpServer()).get('/users/invalid-id').expect(400);
  });
});
