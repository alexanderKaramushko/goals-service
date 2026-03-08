import { Module } from '@nestjs/common';
import { DbModule } from './modules/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app/app.controller';
import { TargetModule } from './modules/targets/targets.module';
import { StepsModule } from './modules/steps/steps.module';
import { SurprisesModule } from './modules/surprises/surprises.module';

@Module({
  imports: [
    DbModule,
    ConfigModule.forRoot(),
    TargetModule,
    StepsModule,
    SurprisesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
