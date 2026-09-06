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
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authMicroserviceService: AuthMicroserviceService,
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies.access_token as string | null;

    if (!token) {
      throw new UnauthorizedException('Не найден токен доступа');
    }

    const tokenPayload = this.tokenService.verifyToken(token);

    if (!tokenPayload) {
      throw new UnauthorizedException('Неверный токен доступа');
    }

    try {
      const user = await this.usersService.getUser({
        userId: tokenPayload.sub,
      });

      request.user = user;

      return !!request.user;
    } catch {
      let authProviderUser;

      try {
        [authProviderUser] = await this.authMicroserviceService.getSSOUser(
          request.cookies.jwt,
        );
      } catch (error) {
        throw new ServiceUnavailableException(
          `Ошибка получения пользователя: ${error.message}`,
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
        throw new UnauthorizedException(
          'Пользователь не найден в сервисе сервисе SSO',
        );
      }
    }
  }
}
