import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from 'src/infra/config/config.module';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  verifyToken(token: string) {
    try {
      return this.jwtService.verify<{ sub: string }>(token, {
        algorithms: ['RS256'],
        issuer: this.configService.getOrThrow('ISSUER', { infer: true }),
      });
    } catch {
      return null;
    }
  }
}
