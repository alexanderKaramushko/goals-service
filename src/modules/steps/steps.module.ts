import { Module } from '@nestjs/common';
import { StepsService } from './steps.service';
import { StepsController } from './steps.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { StepsRepository } from './steps.repository';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [StepsService, StepsRepository],
  controllers: [StepsController],
})
export class StepsModule {}
