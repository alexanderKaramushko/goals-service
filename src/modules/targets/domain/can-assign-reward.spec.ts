import { dayjs } from 'src/helpers/dayjs';
import { canAssignReward } from './can-assign-reward';

describe('canAssignReward()', () => {
  const currentDate = dayjs('2026-09-27');

  describe('Позитивные сценарии (Награда должна быть разрешена -> true)', () => {
    it('должен вернуть true, если все шаги выполнены вовремя (0% просрочки)', () => {
      expect(
        canAssignReward(
          [
            {
              completedAt: dayjs('2026-09-01'),
              shouldBeCompletedAt: dayjs('2026-09-02'),
            }, // вовремя
            {
              completedAt: dayjs('2026-09-20'),
              shouldBeCompletedAt: dayjs('2026-09-21'),
            }, // вовремя
          ],
          currentDate,
          20,
        ),
      ).toBe(true);
    });

    it('должен вернуть true, если процент просроченных шагов строго меньше лимита maxOutdatedStepsPercentage', () => {
      expect(
        canAssignReward(
          [
            {
              completedAt: dayjs('2026-09-10'),
              shouldBeCompletedAt: dayjs('2026-09-05'),
            }, // просрочен
            {
              completedAt: dayjs('2026-09-04'),
              shouldBeCompletedAt: dayjs('2026-09-05'),
            }, // вовремя
            {
              completedAt: dayjs('2026-09-05'),
              shouldBeCompletedAt: dayjs('2026-09-05'),
            }, // вовремя
            {
              completedAt: dayjs('2026-09-03'),
              shouldBeCompletedAt: dayjs('2026-09-05'),
            }, // вовремя
          ],
          currentDate,
          30,
        ),
      ).toBe(true);
    });

    it('должен вернуть true, если массив шагов пустой (защита от деления на ноль)', () => {
      expect(canAssignReward([], currentDate, 20)).toBe(true);
    });

    it('должен вернуть true для невыполненного шага, если его дедлайн еще не наступил', () => {
      expect(
        canAssignReward(
          [
            {
              completedAt: null,
              shouldBeCompletedAt: dayjs('2026-09-30'),
            },
          ],
          currentDate,
          20,
        ),
      ).toBe(true);
    });

    it('должен вернуть true, если шаг завершен ровно в день дедлайна (граничное значение даты)', () => {
      expect(
        canAssignReward(
          [
            {
              completedAt: dayjs('2026-09-25'),
              shouldBeCompletedAt: dayjs('2026-09-25'),
            },
          ],
          currentDate,
          20,
        ),
      ).toBe(true);
    });
  });

  describe('Негативные сценарии (Награда должна быть запрещена -> false)', () => {
    it('должен вернуть false, если процент просрочки строго равен maxOutdatedStepsPercentage (граничное значение)', () => {
      expect(
        canAssignReward(
          [
            {
              completedAt: dayjs('2026-09-10'),
              shouldBeCompletedAt: dayjs('2026-09-05'),
            }, // просрочен
            {
              completedAt: dayjs('2026-09-05'),
              shouldBeCompletedAt: dayjs('2026-09-05'),
            }, // вовремя
            {
              completedAt: dayjs('2026-09-05'),
              shouldBeCompletedAt: dayjs('2026-09-05'),
            }, // вовремя
            {
              completedAt: dayjs('2026-09-05'),
              shouldBeCompletedAt: dayjs('2026-09-05'),
            }, // вовремя
          ],
          currentDate,
          25,
        ),
      ).toBe(false);
    });

    it('должен вернуть false, если процент просрочки строго больше лимита maxOutdatedStepsPercentage', () => {
      expect(
        canAssignReward(
          [
            {
              completedAt: dayjs('2026-09-10'),
              shouldBeCompletedAt: dayjs('2026-09-05'),
            }, // просрочен
            {
              completedAt: dayjs('2026-09-05'),
              shouldBeCompletedAt: dayjs('2026-09-05'),
            }, // вовремя
          ],
          currentDate,
          20,
        ),
      ).toBe(false);
    });

    it('должен вернуть false для невыполненного шага, если его дедлайн уже прошел относительно currentDate', () => {
      expect(
        canAssignReward(
          [
            {
              completedAt: null,
              shouldBeCompletedAt: dayjs('2026-09-25'),
            },
          ],
          currentDate,
          20,
        ),
      ).toBe(false);
    });

    it('должен вернуть false, если шаг был завершен даже на один день позже дедлайна', () => {
      expect(
        canAssignReward(
          [
            {
              completedAt: dayjs('2026-09-26'),
              shouldBeCompletedAt: dayjs('2026-09-25'),
            },
          ],
          currentDate,
          20,
        ),
      ).toBe(false);
    });
  });
});
