import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString } from 'class-validator';

export enum TargetStatus {
  Created = 'created',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export class CreateTargetDto {
  @ApiProperty({ example: 'Составить план питаний' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Расписать план питания и составить список продуктов',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '2026-02-14T06:45:30.000Z',
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

  @ApiProperty({ example: 'Составить план питаний' })
  title: string;

  @ApiProperty({
    example: 'Расписать план питания и составить список продуктов',
  })
  description: string;

  @ApiProperty({ example: TargetStatus.Created, enum: TargetStatus })
  status: string;

  @ApiProperty({ example: '2026-02-14T10:45:30.000Z' })
  shouldBeCompletedAt: string;
}
