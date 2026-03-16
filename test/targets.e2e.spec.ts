import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TargetModule } from '../src/modules/targets/targets.module';
import { CreateTargetDto } from 'src/modules/targets/dto';
import { createTestingApp } from './helpers/create-testing-app';

describe('Targets (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp({
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

  it.todo('isOutdated = true, если текущая дата больше чем дата дедлайна');

  it.todo('isOutdated = false, если текущая дата равна дате дедлайна');

  it.todo('isOutdated = false, если текущая дата меньше даты дедлайна');

  it.todo('isOutdated = true, если дата завершения больше даты дедлайна');

  it.todo('isOutdated = false, если дата завершения равна дате дедлайна');

  it.todo('isOutdated = false, если дата завершения меньше даты дедлайна');

  it.todo(
    'Edge case: isOutdated = true, если дата по таймзоне больше даты дедлайна',
  );
});
