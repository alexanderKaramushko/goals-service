export type CreateStepRepositoryPayload = {
  title: string;
  description: string;
  shouldBeCompletedAt: string;
  targetId: number;
};

export type GetAllAscDeadlineByTargetIdPayload = {
  targetId: number;
};

export type GetStepForUserIdPayload = {
  stepId: number;
  userId: string;
};

export type GetTargetByStepIdPayload = {
  stepId: number;
  userId: string;
};

export type CompleteStepRepositoryPayload = {
  stepId: number;
  resultComment: string;
};
