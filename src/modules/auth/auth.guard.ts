import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthMicroserviceService } from 'src/modules/microservices/auth/auth-microservice.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authMicroserviceService: AuthMicroserviceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      if (!request.cookies.jwt) {
        throw new NotFoundException(`JWT-токен не найден`);
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
    } catch (error: unknown) {
      throw new NotFoundException(`Пользователь не найден: ${error as string}`);
    }
  }
}
