import { Module } from '@nestjs/common';
import { DbModule } from 'src/modules/db/db.module';
import { AppController } from 'src/app/app.controller';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { StepsModule } from 'src/modules/steps/steps.module';
import { RewardsModule } from 'src/modules/rewards/rewards.module';
import { AppConfigModule } from 'src/infra/config/config.module';

@Module({
  imports: [
    AppConfigModule,
    DbModule,
    TargetsModule,
    StepsModule,
    RewardsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
