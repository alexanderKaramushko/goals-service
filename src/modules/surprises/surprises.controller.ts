import {
  Body,
  Controller,
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
} from '@nestjs/swagger';
import { SurprisesService } from './surprises.service';
import { CreatedSurpriseResponseDto, CreateSurpriseDto } from './dto';

@UseInterceptors(UserCreateInterceptor)
@UseGuards(AuthGuard)
@ApiCookieAuth('jwt')
@Controller('surprises')
export class SurprisesController {
  constructor(private readonly surprisesService: SurprisesService) {}

  @ApiOperation({ summary: 'Создать сюрприз' })
  @ApiCreatedResponse({
    description: 'Сюрприз создан',
    type: CreatedSurpriseResponseDto,
  })
  @Post('create')
  create(@Body() createSurpriseDto: CreateSurpriseDto) {
    return this.surprisesService.create(createSurpriseDto);
  }
}
