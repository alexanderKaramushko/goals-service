export type CreateRewardPayload = {
  title: string;
  description: string;
  userId: string;
  targetId: number;
};

export type CreatedRewardResponse = {
  id: number;
  userId: string | null;
  targetId: number | null;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  acceptedAt: string | null;
};
