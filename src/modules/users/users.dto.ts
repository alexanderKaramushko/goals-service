import { IsNotEmpty, IsEnum } from 'class-validator';
import { Provider } from './users.types';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  subjectId: string;

  @IsNotEmpty()
  @IsEnum(Provider)
  provider: Provider;
}

export class CreatedUserResponseDto {
  id: string;
  fullName: string;
  createdAt: string;
}
