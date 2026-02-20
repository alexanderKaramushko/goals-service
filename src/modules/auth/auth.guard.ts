import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthMicroserviceService } from 'src/modules/microservices/auth/auth-microservice.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authMicroserviceService: AuthMicroserviceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.cookies.jwt) {
      throw new UnauthorizedException();
    }

    const [user] = await this.authMicroserviceService.getUserByJwt(
      request.cookies.jwt as string,
    );

    if (user) {
      request.user = user;

      return !!user;
    } else {
      throw new UnauthorizedException('Пользователь не найден');
    }
  }
}
