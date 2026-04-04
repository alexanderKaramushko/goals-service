import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { StepsModule } from '../src/modules/steps/steps.module';
import { CreateStepDto } from 'src/modules/steps/dto';
import { createTestingApp } from './helpers/create-testing-app';

describe('Steps (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp({
      modules: [StepsModule],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/POST steps/create/:targetId', () => {
    const valid: CreateStepDto = {
      title: 'Test',
      description: 'Desc',
      shouldBeCompletedAt: '2022-01-01T00:00:00.000Z',
    };

    it('/POST steps/create\n\tВалидация :targetId', async () => {
      await request(app.getHttpServer())
        .post('/steps/create/wrongId')
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
    ])(
      '/POST steps/create\n\tВалидация параметра: %s\n',
      async (_, data, message) => {
        await request(app.getHttpServer())
          .post('/steps/create/1')
          .send(data)
          .expect((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toContain(message);
          });
      },
    );
  });
});
