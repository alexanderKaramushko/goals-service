import { forwardRef, Module } from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthMicroServiceModule } from 'src/modules/microservices/auth/auth-microservice.module';
import { UsersModule } from 'src/modules/users/users.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [AuthMicroServiceModule, forwardRef(() => UsersModule), TokenModule],
  providers: [AuthGuard],
  exports: [AuthGuard, AuthMicroServiceModule, TokenModule],
})
export class AuthModule {}
