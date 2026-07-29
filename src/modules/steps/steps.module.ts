import { Module } from '@nestjs/common';
import { StepsService } from 'src/modules/steps/steps.service';
import { StepsController } from 'src/modules/steps/steps.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { StepsRepository } from 'src/modules/steps/steps.repository';
import { DbModule } from 'src/modules/db/db.module';

@Module({
  imports: [AuthModule, UsersModule, DbModule],
  providers: [StepsService, StepsRepository],
  controllers: [StepsController],
})
export class StepsModule {}
