import { Module } from '@nestjs/common';
import { RewardsController } from 'src/modules/rewards/rewards.controller';
import { RewardsService } from 'src/modules/rewards/rewards.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { RewardsRepository } from 'src/modules/rewards/rewards.repository';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [RewardsController],
  providers: [RewardsService, RewardsRepository],
})
export class RewardsModule {}
