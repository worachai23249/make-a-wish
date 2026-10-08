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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
    is_fulfilled BOOLEAN DEFAULT false,
    fulfilled_by TEXT,
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    price TEXT,
    link_url TEXT,
    user_name TEXT,
    user_emoji TEXT,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Friendships Table
CREATE TABLE IF NOT EXISTS public.friendships (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sender_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(sender_id, receiver_id)
);

-- 6. Space Events Table
CREATE TABLE IF NOT EXISTS public.space_events (
    id TEXT PRIMARY KEY,
    space_id TEXT REFERENCES public.spaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    emoji TEXT DEFAULT '🎂',
    event_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) & Allow public anon access for this app
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all access on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on spaces" ON public.spaces FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on space_members" ON public.space_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on wishes" ON public.wishes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on friendships" ON public.friendships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on space_events" ON public.space_events FOR ALL USING (true) WITH CHECK (true);
