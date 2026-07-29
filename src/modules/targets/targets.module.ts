import { Module } from '@nestjs/common';
import { TargetsService } from 'src/modules/targets/targets.service';
import { TargetsController } from 'src/modules/targets/targets.controller';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from 'src/modules/db/db.module';

@Module({
  imports: [AuthModule, UsersModule, ConfigModule, DbModule],
  controllers: [TargetsController],
  providers: [TargetsService, TargetsRepository],
  exports: [TargetsRepository],
})
export class TargetsModule {}
