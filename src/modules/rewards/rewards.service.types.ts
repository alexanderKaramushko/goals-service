import { CurrentUserId } from '../users/users.types';

export type CreateRewardOnTargetPayload = {
  title: string;
  description: string;
  targetId: number;
  senderUserId: CurrentUserId;
};

export type CreatedRewardOnTargetResponse = {
  id: number;
  targetId: number | null;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  acceptedAt: string | null;
};
