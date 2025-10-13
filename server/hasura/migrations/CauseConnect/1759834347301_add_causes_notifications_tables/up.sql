CREATE TABLE IF NOT EXISTS public.causes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  creator_uid TEXT REFERENCES users(firebase_uid),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(firebase_uid),
  message TEXT,
  cause_id UUID REFERENCES causes(id),
  created_at TIMESTAMP DEFAULT NOW()
);