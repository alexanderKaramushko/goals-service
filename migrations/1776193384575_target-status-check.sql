-- Up Migration

CREATE OR REPLACE FUNCTION get_status_order(status TEXT)
  RETURNS INT AS $$
  BEGIN
    RETURN CASE status
      WHEN 'created' THEN 1
      WHEN 'active' THEN 2
      WHEN 'completed' THEN 3
      WHEN 'cancelled' THEN 4
      ELSE 0
    END;
  END;
  $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_target_status_rollback()
  RETURNS trigger AS $$
  BEGIN
      IF get_status_order(NEW.status) < get_status_order(OLD.status) THEN
        RAISE EXCEPTION 'Нельзя откатить статус с % на %', OLD.status, NEW.status;
      END IF;

      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

CREATE TRIGGER check_target_status_transition
BEFORE UPDATE ON targets
FOR EACH ROW
EXECUTE FUNCTION prevent_target_status_rollback();

-- Down Migration