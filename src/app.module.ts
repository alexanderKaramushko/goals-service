import { Module } from '@nestjs/common';
import { DbModule } from './modules/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app/app.controller';
import { TargetModule } from './modules/targets/targets.module';
import { StepsModule } from './modules/steps/steps.module';

@Module({
  imports: [DbModule, ConfigModule.forRoot(), TargetModule, StepsModule],
  controllers: [AppController],
})
export class AppModule {}
