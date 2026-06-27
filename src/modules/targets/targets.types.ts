export enum TargetStatus {
  Created = 'created',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export type TargetRaw = {
  id: number;
  user_id: string;
  title: string;
  description: string;
  status: TargetStatus;
  should_be_completed_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  result_comment: string | null;
  can_assign_reward: boolean | null;
};
