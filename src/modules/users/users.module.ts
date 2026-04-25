import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DbModule } from 'src/modules/db/db.module';
import { UsersRepository } from './users.repository';

@Module({
  imports: [DbModule],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, DbModule],
})
export class UsersModule {}
