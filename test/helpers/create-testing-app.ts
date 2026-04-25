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
import { UserCreateInterceptor } from 'src/interceptors/user-create/user-create.interceptor';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { DbService } from 'src/modules/db/db.service';
import { AUTH_MICROSERVICE } from 'src/modules/microservices/auth/tokens';

export async function createTestingApp(deps: {
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
  const { providers = [], modules = [], guards = [], interceptors = [] } = deps;

  const module = Test.createTestingModule({
    imports: [...modules],
  });

  [
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

          request.user = { subjectId: 1, name: 'Test User' };

          return true;
        },
      },
    },
    ...guards,
  ].forEach(({ provide, useValue }) => {
    module.overrideGuard(provide).useValue(useValue);
  });

  [
    {
      provide: UserCreateInterceptor,
      useValue: {
        intercept: (_context: unknown, next: { handle: () => any }) =>
          next.handle(),
      },
    },
    ...interceptors,
  ].forEach(({ provide, useValue }) => {
    module.overrideInterceptor(provide).useValue(useValue);
  });

  const moduleRef = await module.compile();

  const app = moduleRef.createNestApplication();

  app.useGlobalPipes(new ValidationPipe());

  await app.init();

  return app;
}
