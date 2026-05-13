import { TestingModule } from '@nestjs/testing';
import { createTestingModule } from 'src/helpers/create-testing-module';
import { AuthGuard } from './auth.guard';
import { AuthMicroserviceService } from 'src/modules/microservices/auth/auth-microservice.service';
import { UsersService } from 'src/modules/users/users.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthProviderUser } from 'src/modules/microservices/auth/auth-microservice.interface';
import { CurrentUser } from 'src/modules/users/users.types';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const verifyJwtMock = jest.fn();
  const createUserMock = jest.fn();

  const authMicroserviceService = {
    verifyJwt: verifyJwtMock,
  };

  const usersService = {
    create: createUserMock,
  };

  const mockRequest = {
    cookies: {},
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
  } as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthMicroserviceService,
          useValue: authMicroserviceService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    guard = module.get(AuthGuard);
    mockRequest['user'] = undefined;

    jest.clearAllMocks();
    verifyJwtMock.mockReset();
  });

  it('Должен выбрасывать UnauthorizedException, если jwt cookie отсутствует', async () => {
    mockRequest.cookies = {};

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(verifyJwtMock).not.toHaveBeenCalled();
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it('Должен вызывать verifyJwt с токеном из cookies', async () => {
    mockRequest.cookies = {
      jwt: 'token',
    };

    verifyJwtMock.mockResolvedValue([
      {
        name: 'Alex',
        subjectId: '1',
        provider: 'google',
      } satisfies AuthProviderUser,
    ]);

    await guard.canActivate(mockExecutionContext);

    expect(verifyJwtMock).toHaveBeenCalledWith('token');
  });

  it('Должен создавать пользователя через usersService.create, если JWT валиден', async () => {
    mockRequest.cookies = {
      jwt: 'token',
    };

    const user = {
      name: 'Alex',
      subjectId: '1',
      provider: 'google',
    } satisfies AuthProviderUser;

    verifyJwtMock.mockResolvedValue([user]);

    await guard.canActivate(mockExecutionContext);

    expect(createUserMock).toHaveBeenCalledWith(user);
  });

  it('Должен записывать созданного пользователя в request.user', async () => {
    mockRequest.cookies = {
      jwt: 'token',
    };

    const authProviderUser = {
      name: 'Alex',
      subjectId: '1',
      provider: 'google',
    } satisfies AuthProviderUser;

    const createdUser = {
      id: '1',
      fullName: 'Alex',
      createdAt: '2026-01-01T10:45:30.000Z',
    } satisfies CurrentUser;

    verifyJwtMock.mockResolvedValue([authProviderUser]);
    createUserMock.mockResolvedValue(createdUser);

    await guard.canActivate(mockExecutionContext);

    expect(mockRequest).toEqual(
      expect.objectContaining({
        user: createdUser,
      }),
    );
  });

  it("Должен выбрасывать UnauthorizedException('Пользователь не найден'), если verifyJwt не вернул пользователя", async () => {
    mockRequest.cookies = {
      jwt: 'invalid-jwt',
    };

    verifyJwtMock.mockResolvedValue([]);

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      new UnauthorizedException('Пользователь не найден'),
    );

    expect(createUserMock).not.toHaveBeenCalled();
  });
});
