import { Module } from '@nestjs/common';
import { DbModule } from './modules/db/db.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DbModule, ConfigModule.forRoot()],
})
export class AppModule {}
