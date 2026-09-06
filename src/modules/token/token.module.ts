import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import fs from 'node:fs';
import path from 'node:path';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: () => {
        const keysPath = path.resolve(process.cwd(), './keys');

        return {
          publicKey: fs.readFileSync(
            path.resolve(keysPath, 'public.pem'),
            'utf-8',
          ),
        };
      },
    }),
  ],
  providers: [TokenService],
  exports: [TokenService, JwtModule],
})
export class TokenModule {}
