import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { Provider } from './users.types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  subjectId: string;

  @IsNotEmpty()
  @IsEnum(Provider)
  provider: Provider;
}

export class UserResponseDto {
  @ApiProperty({
    example: '108266036103493388680',
    description: 'Id пользователя',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    example: 'Alex Karamushko',
    description: 'Имя пользователя',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: '2026-06-21 16:37:39.368 +0400',
    description: 'Дата создания',
  })
  @IsString()
  @IsNotEmpty()
  createdAt: string;
}
