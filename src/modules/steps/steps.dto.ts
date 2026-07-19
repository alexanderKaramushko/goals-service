import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsString } from 'class-validator';

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
  targetId: number;

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
  closedAt: string | null;

  @ApiProperty({ example: '2026-02-14T10:45:30.000Z' })
  createdAt: string;

  @ApiProperty({
    example: null,
    type: String,
    nullable: true,
  })
  completedAt: string | null;
}

export class StepsResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  targetId: number;

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
  completedAt: string | null;

  @ApiProperty({ example: false })
  isOutdated: boolean;
}

export class CompleteStepDto {
  @ApiProperty({
    example: 'Посмотрел видео по правильному питанию',
    description: 'Описание итогов завершаемого шага',
  })
  @IsNotEmpty()
  @IsString()
  resultComment: string;
}

export class CompletedStepResponseDto {
  @ApiProperty({
    example: '2024-05-17',
    description: 'Дата завершения шага',
  })
  @IsDateString()
  completedAt: string | null;
}

export class DeletedStepResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Id удаленного шага',
  })
  id: number;
}
