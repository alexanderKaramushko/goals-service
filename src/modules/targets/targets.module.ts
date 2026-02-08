import { Module } from '@nestjs/common';
import { TargetsService } from './targets.service';
import { TargetsController } from './targets.controller';
import { DbModule } from 'src/modules/db/db.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthMicroserviceModule } from 'src/modules/microservices/auth/auth-microservice.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DbModule, AuthMicroserviceModule, AuthModule, UsersModule],
  controllers: [TargetsController],
  providers: [TargetsService],
})
export class TargetModule {}
