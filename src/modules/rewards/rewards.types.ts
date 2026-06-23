export enum RewardType {
  'user' = 'user',
  'target' = 'target',
}

export type RewardRaw = {
  id: number;
  recipient_user_id: string | null;
  sender_user_id: string | null;
  target_id: number | null;
  title: string;
  description: string;
  type: string;
  created_at: string;
  accepted_at: string | null;
};
