import { Module } from '@nestjs/common';
import { DbModule } from './modules/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DbModule, ConfigModule.forRoot(), UsersModule],
})
export class AppModule {}
