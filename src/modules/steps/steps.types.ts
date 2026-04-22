export type StepRaw = {
  id: number;
  // TODO target_id не должен быть null
  // Шаг ВСЕГДА привязан к цели
  target_id: number | null;
  title: string;
  description: string;
  should_be_completed_at: string;
  closed_at: string | null;
  created_at: string;
  completed_at: string | null;
};
