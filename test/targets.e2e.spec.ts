import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TargetModule } from '../src/modules/targets/targets.module';

describe('Targets (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TargetModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  const valid = {
    title: 'Test',
    description: 'Desc',
    shouldBeCompletedAt: '2022-01-01T00:00:00.000Z',
  };

  it.each([
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

  afterAll(async () => {
    await app.close();
  });
});
