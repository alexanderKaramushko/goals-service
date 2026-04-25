import { Module } from '@nestjs/common';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RewardsRepository } from './rewards.repository';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [RewardsController],
  providers: [RewardsService, RewardsRepository],
})
export class RewardsModule {}
