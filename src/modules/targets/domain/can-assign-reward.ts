import { Dayjs } from 'dayjs';

export function canAssignReward(
  steps: {
    completedAt: Dayjs | null;
    shouldBeCompletedAt: Dayjs;
  }[],
  currentDate: Dayjs,
  maxOutdatedStepsPercentage: number,
) {
  const outdatedSteps = steps.filter((step) => {
    return step.completedAt
      ? step.completedAt.isAfter(step.shouldBeCompletedAt, 'day')
      : currentDate.isAfter(step.shouldBeCompletedAt, 'day');
  });

  const outdatedPercentage =
    outdatedSteps.length && steps.length
      ? (outdatedSteps.length / steps.length) * 100
      : 0;

  return outdatedPercentage < maxOutdatedStepsPercentage;
}
