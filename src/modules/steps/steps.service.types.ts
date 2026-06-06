export type CreateStepPayload = {
  title: string;
  description: string;
  shouldBeCompletedAt: string;
  targetId: number;
  userTimezone: string;
};

export type StepCreatedResponse = {
  id: number;
  targetId: number;
  title: string;
  description: string;
  shouldBeCompletedAt: string;
  closed_at: string | null;
  created_at: string;
  completed_at: string | null;
};

export type StepsListItem = {
  id: number;
  targetId: number;
  title: string;
  description: string;
  shouldBeCompletedAt: string;
  completedAt: string | null;
  isOutdated: boolean;
};

export type GetStepsPayload = {
  targetId: number;
  userTimezone: string;
};

export type CompleteStepPayload = {
  stepId: number;
  resultComment: string;
  userId: string;
  userTimezone: string;
};

export type CompletedStepResponse = {
  completedAt: string | null;
};
