import { Module } from '@nestjs/common';
import { DbModule } from 'src/modules/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/app/app.controller';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { StepsModule } from 'src/modules/steps/steps.module';
import { RewardsModule } from 'src/modules/rewards/rewards.module';

@Module({
  imports: [
    DbModule,
    ConfigModule.forRoot(),
    TargetsModule,
    StepsModule,
    RewardsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
