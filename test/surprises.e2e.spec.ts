import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AUTH_MICROSERVICE } from 'src/modules/microservices/auth/tokens';
import { of } from 'rxjs';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { UserCreateInterceptor } from 'src/interceptors/user-create/user-create.interceptor';
import { CreateSurpriseDto } from 'src/modules/surprises/dto';
import { SurprisesModule } from 'src/modules/surprises/surprises.module';
import { DbService } from 'src/modules/db/db';

describe('Surprises (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const authMicroserviceMock = {
      send: jest
        .fn()
        .mockReturnValue(of([{ subjectId: 1, name: 'Test User' }])),
      emit: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    const dbMock = {
      query: jest.fn().mockReturnValue([]),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [SurprisesModule],
    })
      .overrideProvider(DbService)
      .useValue(dbMock)
      .overrideProvider(AUTH_MICROSERVICE)
      .useValue(authMicroserviceMock)
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(UserCreateInterceptor)
      .useValue({
        intercept: (_context: unknown, next: { handle: () => any }) =>
          next.handle(),
      })
      .compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  const valid: CreateSurpriseDto = {
    title: 'Test',
    description: 'Desc',
  };

  it.each<[string, CreateSurpriseDto]>([
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
  ])('/POST surprises/create\n\tВалидация параметра: %s\n', async (_, data) => {
    await request(app.getHttpServer())
      .post('/surprises/create')
      .send(data)
      .expect(400);
  });

  it.todo('Выбор типа "user" при передаче userId');

  it.todo('Выбор типа "target" при передаче targetId');

  afterAll(async () => {
    await app.close();
  });
});
