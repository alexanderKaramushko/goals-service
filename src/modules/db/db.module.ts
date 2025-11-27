import { Module } from '@nestjs/common';
import { Db } from './db';

@Module({
  providers: [Db],
  exports: [Db],
})
export class DbModule {}
