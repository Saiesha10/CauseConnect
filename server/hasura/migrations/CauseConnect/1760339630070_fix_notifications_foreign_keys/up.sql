-- Drop existing foreign key constraints if they exist
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_cause_id_fkey;

-- Add corrected foreign key constraints
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.users(firebase_uid)
  ON DELETE CASCADE;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_cause_id_fkey
  FOREIGN KEY (cause_id)
  REFERENCES public.causes(id)
  ON DELETE CASCADE;
