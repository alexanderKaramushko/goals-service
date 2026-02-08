import { Module } from '@nestjs/common';
import { DbService } from './db';

@Module({
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {}
