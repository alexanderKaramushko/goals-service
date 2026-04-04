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

  describe('/POST rewards/create', () => {
    const valid: CreateRewardDto = {
      title: 'Test',
      description: 'Desc',
    };

    it.each<[string, CreateRewardDto, string]>([
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
        'userId',
        {
          ...valid,
          userId: 1,
        },
        'userId must be a string',
      ],
      [
        'targetId',
        {
          ...valid,
          targetId: '1',
        } as any, // `as any` для проверки, что валидация упадет в 400-ю
        'targetId must be an integer number',
      ],
    ])(
      '/POST rewards/create\n\tВалидация параметра: %s\n',
      async (_, data, message) => {
        await request(app.getHttpServer())
          .post('/rewards/create')
          .send(data)
          .expect((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toContain(message);
          });
      },
    );
  });

  // TODO Реализация теста будет через testcontainers
  it.todo('Выбор типа "user" при передаче userId');

  // TODO Реализация теста будет через testcontainers
  it.todo('Выбор типа "target" при передаче targetId');
});
