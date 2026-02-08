import { IsNotEmpty, IsDateString } from 'class-validator';

export class CreateTargetDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  shouldBeCompletedAt: string;
}
