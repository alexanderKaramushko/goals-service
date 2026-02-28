import { Module } from '@nestjs/common';
import { StepsService } from './steps.service';
import { StepsController } from './steps.controller';
import { DbModule } from '../db/db.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { AuthMicroserviceModule } from '../microservices/auth/auth-microservice.module';

@Module({
  imports: [DbModule, AuthMicroserviceModule, AuthModule, UsersModule],
  providers: [StepsService],
  controllers: [StepsController],
})
export class StepsModule {}
