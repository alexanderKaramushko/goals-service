import { Inject, Injectable } from '@nestjs/common';
import { type ClientProxy } from '@nestjs/microservices';
import { AUTH_MICROSERVICE } from 'src/modules/microservices/auth/tokens';
import { AuthProviderUser } from 'src/modules/microservices/auth/auth-microservice.interface';

@Injectable()
export class AuthMicroserviceService {
  constructor(
    @Inject(AUTH_MICROSERVICE) private authMicroservice: ClientProxy,
  ) {}

  verifyJwt(jwt: string): Promise<AuthProviderUser[]> {
    return this.authMicroservice.send('auth.user', jwt).toPromise();
  }
}
