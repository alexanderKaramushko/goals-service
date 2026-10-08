import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ClientProxy } from '@nestjs/microservices';
import { AUTH_MICROSERVICE } from 'src/modules/microservices/auth/tokens';
import { AuthProviderUser } from 'src/modules/microservices/auth/auth-microservice.interface';

@Injectable()
export class AuthMicroserviceService {
  private readonly logger = new Logger(AuthMicroserviceService.name);

  constructor(
    @Inject(AUTH_MICROSERVICE) private authMicroservice: ClientProxy,
  ) {}

  async getSSOUser(accessToken: string): Promise<AuthProviderUser[]> {
    try {
      return await this.authMicroservice
        .send('auth.user', accessToken)
        .toPromise();
    } catch (error) {
      this.logger.error('Ошибка получения пользователя', error);

      return [];
    }
  }
}
