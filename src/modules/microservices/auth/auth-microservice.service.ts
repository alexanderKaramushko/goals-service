import { Inject, Injectable } from '@nestjs/common';
import { type ClientProxy } from '@nestjs/microservices';
import { AUTH_MICROSERVICE } from './tokens';
import { AuthUser } from './types';

@Injectable()
export class AuthMicroserviceService {
  constructor(
    @Inject(AUTH_MICROSERVICE) private authMicroservice: ClientProxy,
  ) {}

  getUserByJwt(jwt: string): Promise<AuthUser> {
    return this.authMicroservice.send('auth.user', jwt).toPromise();
  }
}
