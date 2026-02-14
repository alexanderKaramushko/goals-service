import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

@Controller('app')
export class AppController {
  @ApiResponse({ status: 200, description: 'OK' })
  @Get('health')
  test() {
    return 'OK';
  }
}
