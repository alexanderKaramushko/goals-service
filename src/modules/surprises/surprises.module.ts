import { Module } from '@nestjs/common';
import { SurprisesController } from './surprises.controller';
import { SurprisesService } from './surprises.service';
import { DbModule } from '../db/db.module';
import { AuthMicroserviceModule } from '../microservices/auth/auth-microservice.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DbModule, AuthMicroserviceModule, AuthModule, UsersModule],
  controllers: [SurprisesController],
  providers: [SurprisesService],
})
export class SurprisesModule {}
