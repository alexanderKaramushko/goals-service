import { Logger, Module } from '@nestjs/common';
import { DbService } from 'src/modules/db/db.service';

@Module({
  providers: [DbService, Logger],
  exports: [DbService],
})
export class DbModule {}
