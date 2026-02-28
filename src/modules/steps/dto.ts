import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString } from 'class-validator';

export class CreateStepDto {
  @ApiProperty({ example: 'Рецепты для плана питания' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Найти рецепты для планов питания и составить список продуктов',
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

export class CreatedStepResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  targetId: string;

  @ApiProperty({ example: 'Рецепты для плана питания' })
  title: string;

  @ApiProperty({
    example: 'Найти рецепты для планов питания и составить список продуктов',
  })
  description: string;

  @ApiProperty({ example: '2026-02-14T10:45:30.000Z' })
  shouldBeCompletedAt: string;

  @ApiProperty({
    example: null,
    type: String,
    nullable: true,
  })
  closed_at: string | null;

  @ApiProperty({ example: '2026-02-14T10:45:30.000Z' })
  created_at: string;

  @ApiProperty({
    example: null,
    type: String,
    nullable: true,
  })
  completed_at: string | null;
}
