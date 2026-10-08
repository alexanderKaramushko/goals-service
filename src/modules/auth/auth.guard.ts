import {
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthMicroserviceService } from 'src/modules/microservices/auth/auth-microservice.service';
import { UsersService } from 'src/modules/users/users.service';
import { CreateOrUpdateUserPayload } from 'src/modules/users/users.service.types';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private authMicroserviceService: AuthMicroserviceService,
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies.access_token as string | null;

    if (!token) {
      this.logger.error('Не найден токен доступа');
      throw new UnauthorizedException('Не найден токен доступа');
    }

    const tokenPayload = this.tokenService.verifyToken(token);

    if (!tokenPayload) {
      this.logger.error('Неверный токен доступа');
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
          request.cookies.access_token,
        );
      } catch (error) {
        this.logger.error('Неверный токен доступа', error);
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
        this.logger.error('Неверный токен доступа');
        throw new UnauthorizedException(
          'Пользователь не найден в сервисе сервисе SSO',
        );
      }
    }
  }
}
