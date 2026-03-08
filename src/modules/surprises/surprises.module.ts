import { Module } from '@nestjs/common';
import { SurprisesController } from './surprises.controller';
import { SurprisesService } from './surprises.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [SurprisesController],
  providers: [SurprisesService],
})
export class SurprisesModule {}
