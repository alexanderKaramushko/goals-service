export type StepRaw = {
  id: number;
  target_id: number;
  title: string;
  description: string;
  should_be_completed_at: string;
  closed_at: string | null;
  created_at: string;
  completed_at: string | null;
};
