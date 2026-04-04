import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { CreateRewardDto } from 'src/modules/rewards/dto';
import { RewardsModule } from 'src/modules/rewards/rewards.module';
import { createTestingApp } from './helpers/create-testing-app';

describe('Rewards (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp({
      modules: [RewardsModule],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const valid: CreateRewardDto = {
    title: 'Test',
    description: 'Desc',
  };

  it.each<[string, CreateRewardDto]>([
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
  ])('/POST rewards/create\n\tВалидация параметра: %s\n', async (_, data) => {
    await request(app.getHttpServer())
      .post('/rewards/create')
      .send(data)
      .expect(400);
  });

  // TODO Реализация теста будет через testcontainers
  it.todo('Выбор типа "user" при передаче userId');

  // TODO Реализация теста будет через testcontainers
  it.todo('Выбор типа "target" при передаче targetId');
});
