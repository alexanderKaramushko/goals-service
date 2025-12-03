import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { AuthMicroserviceService } from 'src/modules/microservices/auth/auth-microservice.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private authMicroserviceService: AuthMicroserviceService) {}

  async use(request: Request, response: Response, next: NextFunction) {
    try {
      const user = await this.authMicroserviceService.getUserByJwt(
        request.cookies.jwt as string,
      );

      console.log(user);
    } catch (error: unknown) {
      throw new NotFoundException(`Пользователь не найден: ${error as string}`);
    }

    next();
  }
}
