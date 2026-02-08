import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthMicroserviceModule } from 'src/modules/microservices/auth/auth-microservice.module';

@Module({
  imports: [AuthMicroserviceModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
