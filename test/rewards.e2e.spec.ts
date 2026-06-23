import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { CreateRewardOnTargetDto } from 'src/modules/rewards/rewards.dto';
import { RewardsModule } from 'src/modules/rewards/rewards.module';
import { createTestingApp } from 'src/helpers/create-testing-app';

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
    const valid: CreateRewardOnTargetDto = {
      title: 'Test',
      description: 'Desc',
    };

    it('Валидация :targetId', async () => {
      app = await createTestingApp({
        modules: [RewardsModule],
      });

      await request(app.getHttpServer())
        .post('/rewards/create/wrongId')
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

    it.each<[string, CreateRewardOnTargetDto, string]>([
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
    ])(
      '/POST rewards/create\n\tВалидация параметра: %s\n',
      async (_, data, message) => {
        await request(app.getHttpServer())
          .post('/rewards/create/1')
          .send(data)
          .expect((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toContain(message);
          });
      },
    );
  });
});
