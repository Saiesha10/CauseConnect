-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_role enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'organizer');
    END IF;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    full_name text,
    role user_role DEFAULT 'user',
    created_at timestamp with time zone DEFAULT now(),
    profile_picture text,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Create ngos table
CREATE TABLE IF NOT EXISTS public.ngos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    cause text,
    description text,
    location text,
    contact_info text,
    donation_link text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    ngo_picture text,
    CONSTRAINT ngos_pkey PRIMARY KEY (id),
    CONSTRAINT ngos_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    ngo_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    event_date timestamp with time zone,
    location text,
    volunteers_needed integer,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT events_pkey PRIMARY KEY (id),
    CONSTRAINT events_ngo_id_fkey FOREIGN KEY (ngo_id) REFERENCES public.ngos(id)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    ngo_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT favorites_pkey PRIMARY KEY (id),
    CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT favorites_ngo_id_fkey FOREIGN KEY (ngo_id) REFERENCES public.ngos(id)
);

-- Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    ngo_id uuid,
    amount numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT donations_pkey PRIMARY KEY (id),
    CONSTRAINT donations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT donations_ngo_id_fkey FOREIGN KEY (ngo_id) REFERENCES public.ngos(id)
);

-- Create test_nogs table (optional)
CREATE TABLE IF NOT EXISTS public.test_nogs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    cause text,
    location text,
    CONSTRAINT test_nogs_pkey PRIMARY KEY (id)
);