ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS firebase_uid text UNIQUE;
