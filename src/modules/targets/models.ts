import { TargetStatus } from './dto';

export type Target = {
  id: number;
  user_id: string;
  title: string;
  description: string;
  status: TargetStatus;
  should_be_completed_at: string;
  is_outdated: boolean;
};
