import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthMicroserviceService } from 'src/modules/microservices/auth/auth-microservice.service';
import { CreateUserDto } from 'src/modules/users/dto';
import { UsersService } from 'src/modules/users/users.service';

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

    const [authProviderUser] = await this.authMicroserviceService.verifyJwt(
      request.cookies.jwt,
    );

    if (authProviderUser) {
      const [user] =
        (await this.usersService.createOrUpdate(
          authProviderUser as CreateUserDto,
        )) ?? [];

      request.user = user;

      return !!request.user;
    } else {
      throw new UnauthorizedException('Пользователь не найден');
    }
  }
}
