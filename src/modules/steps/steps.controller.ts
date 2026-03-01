import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserCreateInterceptor } from 'src/interceptors/user-create/user-create.interceptor';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { StepsService } from './steps.service';
import { CreatedStepResponseDto, CreateStepDto } from './dto';

@UseInterceptors(UserCreateInterceptor)
@UseGuards(AuthGuard)
@ApiCookieAuth('jwt')
@Controller('steps')
export class StepsController {
  constructor(private stepsService: StepsService) {}

  @ApiOperation({ summary: 'Создать шаг' })
  @ApiCreatedResponse({
    description: 'Шаг создан',
    type: CreatedStepResponseDto,
  })
  @ApiParam({
    name: 'targetId',
    required: true,
    type: Number,
  })
  @Post('create/:targetId')
  async create(
    @Param('targetId', ParseIntPipe) targetId: number,
    @Body() createStepDto: CreateStepDto,
  ) {
    return await this.stepsService.create(targetId, createStepDto);
  }
}
