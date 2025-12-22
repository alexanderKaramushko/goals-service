import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { Db } from 'src/modules/db/db';
import { AuthMicroserviceService } from 'src/modules/microservices/auth/auth-microservice.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    private authMicroserviceService: AuthMicroserviceService,
    private db: Db,
  ) {}

  async use(request: Request, response: Response, next: NextFunction) {
    try {
      const [user] = await this.authMicroserviceService.getUserByJwt(
        request.cookies.jwt as string,
      );

      if (user) {
        await this.db.query(
          'INSERT INTO users (id, full_name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          [user.subjectId, user.name],
        );
      } else {
        throw new NotFoundException('Пользователь не найден');
      }
    } catch (error: unknown) {
      throw new NotFoundException(`Пользователь не найден: ${error as string}`);
    }

    next();
  }
}
