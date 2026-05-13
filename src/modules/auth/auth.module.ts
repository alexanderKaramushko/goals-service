import { Module } from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthMicroserviceModule } from 'src/modules/microservices/auth/auth-microservice.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthMicroserviceModule, UsersModule],
  providers: [AuthGuard],
  exports: [AuthGuard, AuthMicroserviceModule, UsersModule],
})
export class AuthModule {}
