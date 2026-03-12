import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { CreateSurpriseDto } from 'src/modules/surprises/dto';
import { SurprisesModule } from 'src/modules/surprises/surprises.module';
import { createTestingApp } from './helpers/create-testing-app';

describe('Surprises (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp({
      modules: [SurprisesModule],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const valid: CreateSurpriseDto = {
    title: 'Test',
    description: 'Desc',
  };

  it.each<[string, CreateSurpriseDto]>([
    [
      'title',
      {
        ...valid,
        title: '',
      },
    ],
    [
      'description',
      {
        ...valid,
        description: '',
      },
    ],
    [
      'userId',
      {
        ...valid,
        userId: 1,
      },
    ],
    [
      'targetId',
      {
        ...valid,
        targetId: '1',
      } as any, // `as any` для проверки, что валидация упадет в 400-ю
    ],
  ])('/POST surprises/create\n\tВалидация параметра: %s\n', async (_, data) => {
    await request(app.getHttpServer())
      .post('/surprises/create')
      .send(data)
      .expect(400);
  });

  // TODO Реализация теста будет через testcontainers
  it.todo('Выбор типа "user" при передаче userId');

  // TODO Реализация теста будет через testcontainers
  it.todo('Выбор типа "target" при передаче targetId');
});
