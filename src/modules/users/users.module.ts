import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { DbModule } from 'src/modules/db/db.module';
import { UsersRepository } from 'src/modules/users/users.repository';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [DbModule, forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
