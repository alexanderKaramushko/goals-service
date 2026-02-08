import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { from, Observable, switchMap } from 'rxjs';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class UserCreateInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return from(this.usersService.create(request.user)).pipe(
      switchMap(() => next.handle()),
    );
  }
}
