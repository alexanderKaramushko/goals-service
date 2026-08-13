import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { Provider } from './users.types';
import { ApiProperty } from '@nestjs/swagger';
import { TargetStatus } from 'src/modules/targets/targets.types';
import { CreatedRewardOnTargetResponseDto } from 'src/modules/rewards/rewards.dto';

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
    nullable: true,
  })
  @IsString()
  createdAt: string | null;
}

export class UserTargetStepsDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  targetId: number;

  @ApiProperty({ example: 'Накопить 1000р' })
  title: string;

  @ApiProperty({ example: 'Копейка рубль бережет!' })
  description: string;

  @ApiProperty({ example: '2027-02-14' })
  shouldBeCompletedAt: string;

  @ApiProperty({ example: '2026-06-06', nullable: true })
  completedAt: string | null;
}

export class UserTargetsResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Составить план питания' })
  title: string;

  @ApiProperty({
    example: 'Расписать план питания и составить список продуктов',
  })
  description: string;

  @ApiProperty({ example: TargetStatus.Created, enum: TargetStatus })
  status: string;

  @ApiProperty({ example: '2026-02-14' })
  shouldBeCompletedAt: string;

  @ApiProperty({ example: true })
  canAssignReward: boolean;

  @ApiProperty({ example: 'Хочу книгу в награду', nullable: true })
  resultComment: string | null;

  @ApiProperty({
    type: CreatedRewardOnTargetResponseDto,
    nullable: true,
    description: 'Награда, назначенная текущим пользователем',
  })
  reward: CreatedRewardOnTargetResponseDto | null;

  @ApiProperty({
    type: [UserTargetStepsDto],
    description: 'Все шаги цели',
    example: [
      {
        id: 1,
        targetId: 1,
        title: 'Накопить 1000р',
        description: 'Копейка рубль бережет!',
        shouldBeCompletedAt: '2027-02-14',
        completedAt: '2026-06-06',
      },
    ],
  })
  steps: UserTargetStepsDto[];
}
