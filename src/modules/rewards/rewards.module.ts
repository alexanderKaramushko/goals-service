import { Module } from '@nestjs/common';
import { RewardsController } from 'src/modules/rewards/rewards.controller';
import { RewardsService } from 'src/modules/rewards/rewards.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { RewardsRepository } from 'src/modules/rewards/rewards.repository';
import { DbModule } from 'src/modules/db/db.module';
import { TargetsModule } from '../targets/targets.module';

@Module({
  imports: [AuthModule, UsersModule, TargetsModule, DbModule],
  controllers: [RewardsController],
  providers: [RewardsService, RewardsRepository],
})
export class RewardsModule {}
