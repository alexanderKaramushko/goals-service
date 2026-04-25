export type RewardRaw = {
  id: number;
  user_id: string | null;
  target_id: number | null;
  title: string;
  description: string;
  type: string;
  created_at: string;
  accepted_at: string | null;
};
