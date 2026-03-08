import {
  type Provider,
  ValidationPipe,
  ModuleMetadata,
  CanActivate,
  NestInterceptor,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { UserCreateInterceptor } from 'src/interceptors/user-create/user-create.interceptor';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { DbService } from 'src/modules/db/db';
import { AUTH_MICROSERVICE } from 'src/modules/microservices/auth/tokens';

export async function createTestingModule(deps: {
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
}) {
  const {
    providers = [
      {
        provide: DbService,
        useValue: {
          query: () => [],
        },
      },
      {
        provide: AUTH_MICROSERVICE,
        useValue: {
          send: () => of([{ subjectId: 1, name: 'Test User' }]),
          emit: () => {},
          connect: () => undefined,
          close: () => undefined,
        },
      },
    ],
    modules = [],
    guards = [
      {
        provide: AuthGuard,
        useValue: {
          canActivate: () => true,
        },
      },
    ],
    interceptors = [
      {
        provide: UserCreateInterceptor,
        useValue: {
          intercept: (_context: unknown, next: { handle: () => any }) =>
            next.handle(),
        },
      },
    ],
  } = deps;

  const module = Test.createTestingModule({
    imports: [...modules],
  });

  providers.forEach(({ provide, useValue }) => {
    module.overrideProvider(provide).useValue(useValue);
  });

  guards.forEach(({ provide, useValue }) => {
    module.overrideGuard(provide).useValue(useValue);
  });

  interceptors.forEach(({ provide, useValue }) => {
    module.overrideInterceptor(provide).useValue(useValue);
  });

  const moduleRef = await module.compile();

  const app = moduleRef.createNestApplication();

  app.useGlobalPipes(new ValidationPipe());

  await app.init();

  return app;
}
