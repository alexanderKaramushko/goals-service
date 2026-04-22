import { TargetsService } from './targets.service';
import { TargetsRepository } from './targets.repository';

import targets from 'src/mocks/TargetsResponseDto.json';
import { TargetStatus } from './targets.types';
import { BadRequestException } from '@nestjs/common';
import { CreateTargetDto } from './dto';

describe('TargetsService', () => {
  let service: TargetsService;
  const target = targets[0];

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    service = new TargetsService({
      createTarget: () => [],
      getAllByUserId: () => [],
    } as unknown as TargetsRepository);
  });

  it('сервис создается', () => {
    expect(service).toBeDefined();
  });

  it('мапит TargetRaw в CreatedTargetResponseDto', () => {
    const targetRaw = {
      id: 1,
      user_id: '108266036103493388680',
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      status: TargetStatus.Created,
      should_be_completed_at: '2026-02-14T10:45:30.000Z',
      completed_at: '',
      closed_at: '',
      created_at: '2026-01-01T10:45:30.000Z',
      updated_at: '2026-01-01T10:45:30.000Z',
    };

    expect(service.toCreatedResponseDto(targetRaw)).toEqual({
      id: targetRaw.id,
      userId: targetRaw.user_id,
      title: targetRaw.title,
      description: targetRaw.description,
      status: targetRaw.status,
      shouldBeCompletedAt: targetRaw.should_be_completed_at,
    });
  });

  describe('getAllByUserId', () => {
    it('isOutdated = true, если текущая дата больше чем дата дедлайна', () => {
      jest.setSystemTime(new Date(2026, 0, 1));

      expect(
        service.toResponseDto(
          {
            ...target,
            completed_at: '',
            should_be_completed_at: '2025-01-01T20:00:00.000Z',
          },
          'Europe/Moscow',
        ),
      ).toEqual(expect.objectContaining({ isOutdated: true }));
    });

    it('isOutdated = false, если текущая дата равна дате дедлайна', () => {
      jest.setSystemTime(new Date(2026, 0, 1));

      expect(
        service.toResponseDto(
          {
            ...target,
            completed_at: '',
            should_be_completed_at: '2026-01-01T20:00:00.000Z',
          },
          'Europe/Moscow',
        ),
      ).toEqual(expect.objectContaining({ isOutdated: false }));
    });

    it('isOutdated = false, если текущая дата меньше даты дедлайна', () => {
      jest.setSystemTime(new Date(2026, 0, 1));

      expect(
        service.toResponseDto(
          {
            ...target,
            completed_at: '',
            should_be_completed_at: '2027-01-01T20:00:00.000Z',
          },
          'Europe/Moscow',
        ),
      ).toEqual(expect.objectContaining({ isOutdated: false }));
    });

    it('isOutdated = false, если дедлайн в прошлом относительно даты по таймзоне', () => {
      jest.setSystemTime(new Date(2026, 0, 1, 1, 0));

      expect(
        service.toResponseDto(
          {
            ...target,
            completed_at: '',
            should_be_completed_at: '2026-01-01T20:00:00.000Z',
          },
          'America/Anchorage',
        ),
      ).toEqual(expect.objectContaining({ isOutdated: false }));
    });

    it('isOutdated = false, если дедлайн в будущем относительно даты по таймзоне', () => {
      jest.setSystemTime(new Date(2026, 0, 1, 23, 0));

      expect(
        service.toResponseDto(
          {
            ...target,
            completed_at: '',
            should_be_completed_at: '2026-01-01T10:00:00.000Z',
          },
          'Asia/Tokyo',
        ),
      ).toEqual(expect.objectContaining({ isOutdated: false }));
    });

    it('isOutdated = true, если дата завершения больше даты дедлайна', () => {
      expect(
        service.toResponseDto(
          {
            ...target,
            completed_at: '2026-01-01T20:00:00.000Z',
            should_be_completed_at: '2025-01-01T20:00:00.000Z',
          },
          'Asia/Tokyo',
        ),
      ).toEqual(expect.objectContaining({ isOutdated: true }));
    });

    it('isOutdated = false, если дата завершения равна дате дедлайна', () => {
      expect(
        service.toResponseDto(
          {
            ...target,
            completed_at: '2025-01-01T20:00:00.000Z',
            should_be_completed_at: '2025-01-01T20:00:00.000Z',
          },
          'Europe/Moscow',
        ),
      ).toEqual(expect.objectContaining({ isOutdated: false }));
    });

    it('isOutdated = false, если дата завершения меньше даты дедлайна', () => {
      expect(
        service.toResponseDto(
          {
            ...target,
            completed_at: '2024-01-01T20:00:00.000Z',
            should_be_completed_at: '2025-01-01T20:00:00.000Z',
          },
          'Europe/Moscow',
        ),
      ).toEqual(expect.objectContaining({ isOutdated: false }));
    });
  });

  describe('create', () => {
    const valid: CreateTargetDto = {
      title: 'Test',
      description: 'Desc',
      shouldBeCompletedAt: '2022-01-01T00:00:00.000Z',
    };

    it('Валидация пройдена, если shouldBeCompletedAt больше текущей даты', async () => {
      jest.setSystemTime(new Date(2025, 1, 2));

      const result = await service.create({
        ...valid,
        shouldBeCompletedAt: '2025-02-03T20:00:00.000Z',
        userId: 'user-1',
        userTimezone: 'Europe/Moscow',
      });

      expect(result).toEqual([]);
    });

    it('Ошибка валидации, если shouldBeCompletedAt меньше текущей даты', async () => {
      jest.setSystemTime(new Date(2025, 1, 2));

      await expect(
        service.create({
          ...valid,
          shouldBeCompletedAt: '2025-02-01T20:00:00.000Z',
          userId: '108266036103493388680',
          userTimezone: 'Europe/Moscow',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('Ошибка валидации, если shouldBeCompletedAt равен текущей дате', async () => {
      jest.setSystemTime(new Date(2026, 1, 2));

      await expect(
        service.create({
          ...valid,
          shouldBeCompletedAt: '2026-01-02T20:00:00.000Z',
          userId: '108266036103493388680',
          userTimezone: 'Europe/Moscow',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
