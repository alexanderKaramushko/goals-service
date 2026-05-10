import { Module } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { DbModule } from 'src/modules/db/db.module';
import { UsersRepository } from 'src/modules/users/users.repository';

@Module({
  imports: [DbModule],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, DbModule],
})
export class UsersModule {}
