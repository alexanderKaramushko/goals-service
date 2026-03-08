import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TargetModule } from '../src/modules/targets/targets.module';
import { AUTH_MICROSERVICE } from 'src/modules/microservices/auth/tokens';
import { of } from 'rxjs';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { UserCreateInterceptor } from 'src/interceptors/user-create/user-create.interceptor';
import { DbService } from 'src/modules/db/db';
import { CreateTargetDto } from 'src/modules/targets/dto';

describe('Targets (e2e)', () => {
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
      imports: [TargetModule],
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

  afterAll(async () => {
    await app.close();
  });
});
