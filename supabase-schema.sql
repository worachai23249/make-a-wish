-- Supabase PostgreSQL Schema for Make a Wish 🎁
-- Copy and run this in Supabase SQL Editor if needed

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    emoji TEXT DEFAULT '🌸',
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Spaces Table
CREATE TABLE IF NOT EXISTS public.spaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT '1on1',
    emoji TEXT DEFAULT '💕',
    invite_code TEXT UNIQUE NOT NULL,
    owner_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    owner_name TEXT,
    members TEXT[] DEFAULT '{}',
    member_count INT DEFAULT 1,
    wish_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration helpers for existing spaces table
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS members TEXT[] DEFAULT '{}';
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS member_count INT DEFAULT 1;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS wish_count INT DEFAULT 0;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS member_ids TEXT[] DEFAULT '{}';

-- 3. Space Members Table
CREATE TABLE IF NOT EXISTS public.space_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    space_id TEXT REFERENCES public.spaces(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(space_id, user_id)
);

-- 4. Wishes Table
CREATE TABLE IF NOT EXISTS public.wishes (
    id TEXT PRIMARY KEY,
    space_id TEXT REFERENCES public.spaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    emoji TEXT DEFAULT '⭐',
    category TEXT DEFAULT 'item', -- 'item' | 'food' | 'place'
    priority TEXT DEFAULT 'high', -- 'must_have' | 'high' | 'nice_to_have'
    is_fulfilled BOOLEAN DEFAULT false,
    fulfilled_by TEXT,
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    price TEXT,
    link_url TEXT,
    image_url TEXT,
    notes JSONB DEFAULT '[]'::jsonb,
    user_name TEXT,
    user_emoji TEXT,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration helpers for existing wishes table
ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'high';
ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS claimed_by TEXT;
ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS claimed_by_name TEXT;
ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb;

-- 5. Friendships Table
CREATE TABLE IF NOT EXISTS public.friendships (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sender_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(sender_id, receiver_id)
);

-- Migration helpers for existing friendships table (denormalized profile data)
ALTER TABLE public.friendships ADD COLUMN IF NOT EXISTS sender_username TEXT;
ALTER TABLE public.friendships ADD COLUMN IF NOT EXISTS sender_display_name TEXT;
ALTER TABLE public.friendships ADD COLUMN IF NOT EXISTS sender_emoji TEXT DEFAULT '🌸';
ALTER TABLE public.friendships ADD COLUMN IF NOT EXISTS sender_avatar_url TEXT;
ALTER TABLE public.friendships ADD COLUMN IF NOT EXISTS receiver_username TEXT;
ALTER TABLE public.friendships ADD COLUMN IF NOT EXISTS receiver_display_name TEXT;
ALTER TABLE public.friendships ADD COLUMN IF NOT EXISTS receiver_emoji TEXT DEFAULT '🌸';
ALTER TABLE public.friendships ADD COLUMN IF NOT EXISTS receiver_avatar_url TEXT;

-- 6. Space Events Table
CREATE TABLE IF NOT EXISTS public.space_events (
    id TEXT PRIMARY KEY,
    space_id TEXT REFERENCES public.spaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    emoji TEXT DEFAULT '🎂',
    event_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'friend_request' | 'friend_accepted' | 'wish_fulfilled' | 'wish_claimed' | 'event_reminder'
    title TEXT NOT NULL,
    message TEXT,
    emoji TEXT DEFAULT '🔔',
    related_id TEXT, -- ID of related entity (friendship, wish, event)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) & Allow public anon access for this app
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on users') THEN
        CREATE POLICY "Allow public all access on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on spaces') THEN
        CREATE POLICY "Allow public all access on spaces" ON public.spaces FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on space_members') THEN
        CREATE POLICY "Allow public all access on space_members" ON public.space_members FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on wishes') THEN
        CREATE POLICY "Allow public all access on wishes" ON public.wishes FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on friendships') THEN
        CREATE POLICY "Allow public all access on friendships" ON public.friendships FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on space_events') THEN
        CREATE POLICY "Allow public all access on space_events" ON public.space_events FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on notifications') THEN
        CREATE POLICY "Allow public all access on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;
