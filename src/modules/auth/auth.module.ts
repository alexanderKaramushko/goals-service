import { forwardRef, Module } from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthMicroServiceModule } from 'src/modules/microservices/auth/auth-microservice.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [AuthMicroServiceModule, forwardRef(() => UsersModule)],
  providers: [AuthGuard],
  exports: [AuthGuard, AuthMicroServiceModule],
})
export class AuthModule {}
