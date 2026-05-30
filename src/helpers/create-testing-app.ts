import {
  type Provider,
  ValidationPipe,
  ModuleMetadata,
  CanActivate,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { DbService } from 'src/modules/db/db.service';
import { AUTH_MICROSERVICE } from 'src/modules/microservices/auth/tokens';
import { CurrentUser } from 'src/modules/users/users.types';

export async function createTestingApp(
  deps: {
    providers?: {
      provide: Provider;
      useValue: any;
    }[];
    modules?: Exclude<ModuleMetadata['imports'], undefined>;
    guards?: {
      provide: Provider;
      useValue: CanActivate;
    }[];
    interceptors?: {
      provide: Provider;
      useValue: NestInterceptor;
    }[];
  },
  options?: {
    useRealDbService: boolean;
  },
) {
  const { providers = [], modules = [], guards = [], interceptors = [] } = deps;
  const { useRealDbService = false } = options ?? {};

  const module = Test.createTestingModule({
    imports: [...modules],
  });

  [
    ...(useRealDbService
      ? [{}]
      : [
          {
            provide: DbService,
            useValue: {
              query: () => [],
              getPoolClient: () => ({
                query: () => [],
                release: () => {},
              }),
            },
          },
        ]),
    {
      provide: AUTH_MICROSERVICE,
      useValue: {
        send: () => of([{ subjectId: 1, name: 'Test User' }]),
        emit: () => {},
        connect: () => undefined,
        close: () => undefined,
      },
    },
    ...providers,
  ].forEach(({ provide, useValue }) => {
    module.overrideProvider(provide).useValue(useValue);
  });

  [
    {
      provide: AuthGuard,
      useValue: {
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();

          request.user = {
            id: '1',
            fullName: 'Test User',
            createdAt: '2026-01-01T10:45:30.000Z',
          } satisfies CurrentUser;

          return true;
        },
      },
    },
    ...guards,
  ].forEach(({ provide, useValue }) => {
    module.overrideGuard(provide).useValue(useValue);
  });

  [...interceptors].forEach(({ provide, useValue }) => {
    module.overrideInterceptor(provide).useValue(useValue);
  });

  const moduleRef = await module.compile();

  const app = moduleRef.createNestApplication();

  app.useGlobalPipes(new ValidationPipe());

  await app.init();

  return app;
}
