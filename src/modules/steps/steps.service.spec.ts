import { StepsService } from './steps.service';
import { StepsRepository } from './steps.repository';

import steps from 'src/mocks/CreatedStepResponseDto.json';
import { CreateStepDto } from './dto';
import { BadRequestException } from '@nestjs/common';

describe('StepsService', () => {
  let service: StepsService;
  const step = steps[0];

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    service = new StepsService({
      findByTargetIdAndShouldBeCompletedAt: () => [],
      createStep: () => [],
      getAllByTargetId: () => [],
    } as unknown as StepsRepository);
  });

  it('сервис создается', () => {
    expect(service).toBeDefined();
  });

  describe('getAllByTargetId', () => {
    it('isOutdated = true, если текущая дата больше чем дата дедлайна', () => {
      jest.setSystemTime(new Date(2026, 0, 1));

      expect(
        service.toResponseDto(
          {
            ...step,
            completed_at: null,
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
            ...step,
            completed_at: null,
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
            ...step,
            completed_at: null,
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
            ...step,
            completed_at: null,
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
            ...step,
            completed_at: null,
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
            ...step,
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
            ...step,
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
            ...step,
            completed_at: '2024-01-01T20:00:00.000Z',
            should_be_completed_at: '2025-01-01T20:00:00.000Z',
          },
          'Europe/Moscow',
        ),
      ).toEqual(expect.objectContaining({ isOutdated: false }));
    });
  });

  describe.only('create', () => {
    const valid: CreateStepDto = {
      title: 'Test',
      description: 'Desc',
      shouldBeCompletedAt: '2022-01-01T00:00:00.000Z',
    };

    it('Валидация пройдена, если shouldBeCompletedAt больше текущей даты', async () => {
      jest.setSystemTime(new Date(2025, 1, 2));

      const result = await service.create({
        ...valid,
        shouldBeCompletedAt: '2025-02-03T20:00:00.000Z',
        targetId: 1,
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
          targetId: 1,
          userTimezone: 'Europe/Moscow',
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'Дата окончания должна быть больше текущей даты',
        ),
      );
    });

    it('Ошибка валидации, если shouldBeCompletedAt равен текущей дате', async () => {
      jest.setSystemTime(new Date(2026, 1, 2));

      await expect(
        service.create({
          ...valid,
          shouldBeCompletedAt: '2026-01-02T20:00:00.000Z',
          targetId: 1,
          userTimezone: 'Europe/Moscow',
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'Дата окончания должна быть больше текущей даты',
        ),
      );
    });
  });
});
