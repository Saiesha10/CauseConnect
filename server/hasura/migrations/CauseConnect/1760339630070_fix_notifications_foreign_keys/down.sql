-- Drop the corrected foreign key constraints
ALTER TABLE public.causes DROP CONSTRAINT IF EXISTS causes_creator_uid_fkey;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_cause_id_fkey;

-- Optional: restore previous constraints (if known)
-- Example: If you had previous FKs pointing elsewhere, you can re-add them here
-- ALTER TABLE public.notifications
--   ADD CONSTRAINT notifications_user_id_fkey
--   FOREIGN KEY (user_id) REFERENCES some_old_table(id);
-- ALTER TABLE public.notifications
--   ADD CONSTRAINT notifications_cause_id_fkey
--   FOREIGN KEY (cause_id) REFERENCES some_old_table(id);
