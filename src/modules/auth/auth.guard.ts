import {
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthMicroserviceService } from 'src/modules/microservices/auth/auth-microservice.service';
import { UsersService } from 'src/modules/users/users.service';
import { CreateOrUpdateUserPayload } from 'src/modules/users/users.service.types';

type RequestWithJwt = Request & {
  cookies: {
    jwt?: string;
  };
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authMicroserviceService: AuthMicroserviceService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithJwt>();

    if (!request.cookies?.jwt) {
      throw new UnauthorizedException();
    }

    let authProviderUser;

    try {
      [authProviderUser] = await this.authMicroserviceService.verifyJwt(
        request.cookies.jwt,
      );
    } catch (error) {
      throw new ServiceUnavailableException(
        `Ошибка проверки токена: ${error.message}`,
      );
    }

    if (authProviderUser) {
      const [user] =
        (await this.usersService.createOrUpdate(
          authProviderUser as CreateOrUpdateUserPayload,
        )) ?? [];

      request.user = user;

      return !!request.user;
    } else {
      throw new UnauthorizedException('Пользователь не найден');
    }
  }
}
