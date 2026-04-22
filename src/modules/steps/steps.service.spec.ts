import { StepsService } from './steps.service';
import { StepsRepository } from './steps.repository';

import steps from 'src/mocks/CreatedStepResponseDto.json';

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
    service = new StepsService({} as StepsRepository);
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
});
