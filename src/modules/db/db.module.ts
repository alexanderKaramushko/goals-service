import { Module } from '@nestjs/common';
import { DbService } from 'src/modules/db/db.service';

@Module({
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {}
