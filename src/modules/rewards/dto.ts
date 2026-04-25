import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, ValidateIf } from 'class-validator';

export enum RewardType {
  'user' = 'user',
  'target' = 'target',
}

export class CreateRewardDto {
  @ApiProperty({ example: 'За составление плана питания' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'План питания составлен без штрафов',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '108266036103493388680',
  })
  @ValidateIf(
    (_, value) => value !== '' && value !== null && value !== undefined,
  )
  @IsString()
  userId?: string;

  @ApiProperty({
    example: 1,
  })
  @ValidateIf(
    (_, value) => value !== '' && value !== null && value !== undefined,
  )
  @IsInt()
  targetId?: number;
}

export class CreatedRewardResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '108266036103493388680', nullable: true })
  userId: string | null;

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
