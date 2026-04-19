import { Module } from '@nestjs/common';
import { TargetsService } from './targets.service';
import { TargetsController } from './targets.controller';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TargetsRepository } from './targets.repository';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [TargetsController],
  providers: [TargetsService, TargetsRepository],
})
export class TargetModule {}
