import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateTargetDto } from './dto';
import { TargetsService } from './targets.service';

import { type Request as ExpressRequest } from 'express';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { User } from 'src/modules/users/types';
import { UserCreateInterceptor } from 'src/interceptors/user-create/user-create.interceptor';

@UseInterceptors(UserCreateInterceptor)
@UseGuards(AuthGuard)
@Controller('targets')
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  @Post('create')
  create(
    @Body() createTargetDto: CreateTargetDto,
    @Request() request: ExpressRequest & { user: User },
  ) {
    return this.targetsService.create({
      userId: request.user.subjectId,
      ...createTargetDto,
    });
  }
}
