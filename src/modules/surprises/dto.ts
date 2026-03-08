import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, ValidateIf } from 'class-validator';

export enum SurpriseType {
  'user' = 'user',
  'target' = 'target',
}

export class CreateSurpriseDto {
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

export class CreatedSurpriseResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '108266036103493388680' })
  userId: string;

  @ApiProperty({ example: 'За составление плана питания' })
  title: string;

  @ApiProperty({
    example: 'План питания составлен без штрафов',
  })
  description: string;

  @ApiProperty({ example: SurpriseType.target, enum: SurpriseType })
  type: string;

  @ApiProperty({ example: '2026-02-14T10:45:30.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-02-14T10:45:30.000Z' })
  acceptedAt: string;
}
