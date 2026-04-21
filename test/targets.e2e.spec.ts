import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TargetModule } from '../src/modules/targets/targets.module';
import { CreateTargetDto } from 'src/modules/targets/dto';
import { createTestingApp } from './helpers/create-testing-app';

describe('Targets (e2e)', () => {
  let app: INestApplication;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2020, 0, 1));
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('/POST targets/create', () => {
    const valid: CreateTargetDto = {
      title: 'Test',
      description: 'Desc',
      shouldBeCompletedAt: '2022-01-01T20:00:00.000Z',
    };

    it('/POST targets/create с валидными параметрами', async () => {
      app = await createTestingApp({
        modules: [TargetModule],
      });

      await request(app.getHttpServer())
        .post('/targets/create')
        .set({
          'x-user-timezone': 'America/Anchorage',
        })
        .send(valid)
        .expect((res) => {
          expect(res.status).toBe(201);
        });
    });

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
        app = await createTestingApp({
          modules: [TargetModule],
        });

        await request(app.getHttpServer())
          .post('/targets/create')
          .set({
            'x-user-timezone': 'America/Anchorage',
          })
          .send(data)
          .expect((res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toContain(message);
          });
      },
    );

    it('Валидация пройдена, если shouldBeCompletedAt больше текущей даты', async () => {
      jest.setSystemTime(new Date(2025, 1, 2));

      app = await createTestingApp({
        modules: [TargetModule],
      });

      await request(app.getHttpServer())
        .post('/targets/create')
        .set({
          'x-user-timezone': 'Europe/Moscow',
        })
        .send({
          ...valid,
          shouldBeCompletedAt: '2025-02-03T20:00:00.000Z',
        })
        .expect((res) => {
          expect(res.status).toBe(201);
        });
    });

    it('Ошибка валидации, если shouldBeCompletedAt меньше текущей даты', async () => {
      jest.setSystemTime(new Date(2025, 1, 2));

      app = await createTestingApp({
        modules: [TargetModule],
      });

      await request(app.getHttpServer())
        .post('/targets/create')
        .set({
          'x-user-timezone': 'Europe/Moscow',
        })
        .send({
          ...valid,
          shouldBeCompletedAt: '2025-02-01T20:00:00.000Z',
        })
        .expect((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toContain(
            'Дата окончания должна быть больше текущей даты',
          );
        });
    });

    it('Ошибка валидации, если shouldBeCompletedAt равен текущей дате', async () => {
      jest.setSystemTime(new Date(2026, 1, 2));

      app = await createTestingApp({
        modules: [TargetModule],
      });

      await request(app.getHttpServer())
        .post('/targets/create')
        .set({
          'x-user-timezone': 'Europe/Moscow',
        })
        .send({
          ...valid,
          shouldBeCompletedAt: '2026-01-02T20:00:00.000Z',
        })
        .expect((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toContain(
            'Дата окончания должна быть больше текущей даты',
          );
        });
    });
  });
});
