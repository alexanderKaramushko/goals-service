import { Module } from '@nestjs/common';
import { DbModule } from './modules/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app/app.controller';
import { TargetModule } from './modules/targets/targets.module';
import { StepsModule } from './modules/steps/steps.module';
import { RewardsModule } from './modules/rewards/rewards.module';

@Module({
  imports: [
    DbModule,
    ConfigModule.forRoot(),
    TargetModule,
    StepsModule,
    RewardsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
