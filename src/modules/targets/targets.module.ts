import { Module } from '@nestjs/common';
import { TargetsService } from 'src/modules/targets/targets.service';
import { TargetsController } from 'src/modules/targets/targets.controller';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { TargetsRepository } from 'src/modules/targets/targets.repository';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [TargetsController],
  providers: [TargetsService, TargetsRepository],
})
export class TargetModule {}
