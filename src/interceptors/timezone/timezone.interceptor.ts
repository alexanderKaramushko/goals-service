import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const timezone = request.headers['x-user-timezone'];

    if (!timezone) {
      throw new BadRequestException('Не найдена таймзона пользователя');
    }

    request.userTimezone = timezone;

    return next.handle();
  }
}
