import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsString, IsInt } from 'class-validator';
import { TargetStatus } from 'src/modules/targets/targets.types';
import { RewardType } from 'src/modules/rewards/rewards.types';

export class CreateTargetDto {
  @ApiProperty({ example: 'Составить план питания' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Расписать план питания и составить список продуктов',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '2026-02-14',
  })
  @IsNotEmpty()
  @IsDateString()
  shouldBeCompletedAt: string;
}

export class CreatedTargetResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '108266036103493388680' })
  userId: string;

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
}

export class TargetStepsDto {
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

export class TargetRewardsDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: null, nullable: true })
  recipientUserId: string | null;

  @ApiProperty({ example: 1 })
  targetId: number;

  @ApiProperty({ example: RewardType.target, enum: RewardType })
  type: RewardType;

  @ApiProperty({ example: 'Билет в кино' })
  title: string;

  @ApiProperty({ example: 'За успешное завершение цели' })
  description: string;

  @ApiProperty({ example: '108266036103493388680' })
  senderUserId: string;
}

export class TargetsResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '108266036103493388680' })
  userId: string;

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

  @ApiProperty({ example: false })
  isOutdated: boolean;

  @ApiProperty({
    type: [TargetStepsDto],
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
  steps: TargetStepsDto[];

  @ApiProperty({
    type: [TargetRewardsDto],
    description: 'Все награды цели',
    example: [
      {
        id: 1,
        recipientUserId: null,
        targetId: 1,
        type: RewardType.target,
        title: 'Билет в кино',
        description: 'За успешное завершение цели',
        senderUserId: '108266036103493388680',
      },
    ],
  })
  rewards: TargetRewardsDto[];
}

export class CompleteTargetDto {
  @ApiProperty({
    example: 'Сдал на права',
    description: 'Описание итогов завершаемой цели',
  })
  @IsNotEmpty()
  @IsString()
  resultComment: string;
}

export class CompletedTargetResponseDto {
  @ApiProperty({
    example: '2024-05-17',
    description: 'Дата завершения цели',
  })
  @IsDateString()
  completedAt: string | null;
}

export class ActivatedTargetResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Id активированной цели',
  })
  @IsInt()
  id: number;
}

export class CancelledTargetResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Id отмененной цели',
  })
  @IsInt()
  id: number;
}

export class DeletedTargetResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Id удаленной цели',
  })
  @IsInt()
  id: number;
}
