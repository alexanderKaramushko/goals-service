import { Controller, Get, Logger } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { DbService } from 'src/modules/db/db.service';

@Controller('app')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private dbService: DbService) {}

  @ApiResponse({ status: 200, description: 'OK' })
  @Get('health/live')
  live(): string {
    return 'OK!';
  }

  @ApiResponse({ status: 200, description: 'OK' })
  @Get('health/ready')
  async ready(): Promise<string> {
    await this.dbService.query('SELECT 1');

    return 'OK';
  }
}
