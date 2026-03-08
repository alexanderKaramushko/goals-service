import { Module } from '@nestjs/common';
import { StepsService } from './steps.service';
import { StepsController } from './steps.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [StepsService],
  controllers: [StepsController],
})
export class StepsModule {}
