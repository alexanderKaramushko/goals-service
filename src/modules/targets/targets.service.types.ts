export type CreateTargetPayload = {
  title: string;
  description: string;
  shouldBeCompletedAt: string;
  userId: string;
  userTimezone: string;
};

export type GetTargetsPayload = {
  userId: string;
  userTimezone: string;
};

export type TargetCreatedResponse = {
  id: number;
  userId: string;
  title: string;
  description: string;
  status: string;
  shouldBeCompletedAt: string;
};

export type TargetListItem = {
  id: number;
  userId: string;
  title: string;
  description: string;
  status: string;
  shouldBeCompletedAt: string;
  isOutdated: boolean;
};

export type CompleteTargetPayload = {
  targetId: number;
  userId: string;
  userTimezone: string;
  resultComment: string;
};

export type CompletedTargetResponse = {
  completedAt: string | null;
};

export type ActivateTargetPayload = {
  targetId: number;
  userId: string;
  userTimezone: string;
};

export type ActivatedTargetResponse = {
  id: number;
};

export type DeletedTargetPayload = {
  targetId: number;
  userId: string;
};

export type DeletedTargetResponse = {
  id: number;
};
