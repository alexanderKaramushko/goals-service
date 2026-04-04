import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString } from 'class-validator';

export enum TargetStatus {
  Created = 'created',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

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
}
