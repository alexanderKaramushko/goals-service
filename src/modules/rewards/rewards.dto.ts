import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RewardType } from './rewards.types';

export class CreateRewardOnTargetDto {
  @ApiProperty({ example: 'За составление плана питания' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'План питания составлен без штрафов',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}

export class CreatedRewardOnTargetResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1, nullable: true })
  targetId: number | null;

  @ApiProperty({ example: 'За составление плана питания' })
  title: string;

  @ApiProperty({
    example: 'План питания составлен без штрафов',
  })
  description: string;

  @ApiProperty({ example: RewardType.target, enum: RewardType })
  type: string;

  @ApiProperty({ example: '2026-02-14T10:45:30.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-02-14T10:45:30.000Z', nullable: true })
  acceptedAt: string | null;
}
