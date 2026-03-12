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

  const valid: CreateStepDto = {
    title: 'Test',
    description: 'Desc',
    shouldBeCompletedAt: '2022-01-01T00:00:00.000Z',
  };

  it('/POST steps/create\n\tВалидация :targetId', async () => {
    await request(app.getHttpServer())
      .post('/steps/create/wrongId')
      .send(valid)
      .expect(400);
  });

  it.each<[string, CreateStepDto]>([
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
      'shouldBeCompletedAt',
      {
        ...valid,
        shouldBeCompletedAt: 'not-a-timezone',
      },
    ],
  ])('/POST steps/create\n\tВалидация параметра: %s\n', async (_, data) => {
    await request(app.getHttpServer())
      .post('/steps/create/1')
      .send(data)
      .expect(400);
  });
});
