import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  @MessagePattern('create_user')
  handleMessage() {
    return { result: 'Goals service OK' };
  }
}
