import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TargetModule } from '../src/modules/targets/targets.module';
import { CreateTargetDto } from 'src/modules/targets/dto';
import { createTestingModule } from './helpers/createTestingModule';

describe('Targets (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingModule({
      modules: [TargetModule],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const valid: CreateTargetDto = {
    title: 'Test',
    description: 'Desc',
    shouldBeCompletedAt: '2022-01-01T00:00:00.000Z',
  };

  it.each<[string, CreateTargetDto]>([
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
  ])('/POST targets/create\n\tВалидация параметра: %s\n', async (data) => {
    await request(app.getHttpServer())
      .post('/targets/create')
      .send(data)
      .expect(400);
  });
});
