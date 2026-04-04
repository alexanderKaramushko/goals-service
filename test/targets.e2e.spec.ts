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

  describe('/POST targets/create', () => {
    const valid: CreateTargetDto = {
      title: 'Test',
      description: 'Desc',
      shouldBeCompletedAt: '2022-01-01T00:00:00.000Z',
    };

    it.each<[string, CreateTargetDto, string]>([
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
      '/POST targets/create\n\tВалидация параметра: %s\n',
      async (_, data, message) => {
        await request(app.getHttpServer())
          .post('/targets/create')
          .send(data)
          .expect((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toContain(message);
          });
      },
    );

    it.todo('Ошибка валидации, если shouldBeCompletedAt меньше текущей даты');

    it.todo('Ошибка валидации, если shouldBeCompletedAt равен текущей дате');
  });

  describe('GET targets/get-all/:user-id', () => {
    it.todo('isOutdated = true, если текущая дата больше чем дата дедлайна');

    it.todo('isOutdated = false, если текущая дата равна дате дедлайна');

    it.todo('isOutdated = false, если текущая дата меньше даты дедлайна');

    it.todo('isOutdated = true, если дата завершения больше даты дедлайна');

    it.todo('isOutdated = false, если дата завершения равна дате дедлайна');

    it.todo('isOutdated = false, если дата завершения меньше даты дедлайна');

    it.todo('isOutdated = true, если дата по таймзоне больше даты дедлайна');
  });
});
