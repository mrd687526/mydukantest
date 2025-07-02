-- Meta Bot Integration Schema
-- This file creates all tables needed for Messenger/Instagram bot integration

-- 1. Meta App Settings (Superadmin)
create table if not exists meta_app_settings (
  id uuid primary key default gen_random_uuid(),
  app_id text not null,
  app_secret text not null, -- Store encrypted or use Vault/KMS in production
  app_name text,
  is_active boolean default true,
  notes text,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Meta Accounts (Connected FB Pages / IG Accounts)
create table if not exists meta_accounts (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,
  type text not null check (type in ('facebook_page', 'instagram_account')),
  meta_user_id text not null, -- Meta user who authorized
  page_id text,               -- Facebook Page ID (nullable for IG)
  ig_user_id text,            -- Instagram User ID (nullable for FB)
  name text,                  -- Page or IG name
  username text,              -- IG username or FB page username
  access_token text not null, -- Store encrypted
  permissions jsonb,
  profile_pic_url text,
  connected_at timestamptz default now(),
  expires_at timestamptz,
  webhook_verify_token text,
  is_active boolean default true,
  last_error text,
  meta_app_id uuid references meta_app_settings(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Meta Users (Meta user info for audit/logging)
create table if not exists meta_users (
  id uuid primary key default gen_random_uuid(),
  meta_user_id text unique not null,
  name text,
  email text,
  picture_url text,
  locale text,
  timezone text,
  linked_bots uuid[], -- Array of bot IDs this user has connected
  created_at timestamptz default now(),
  updated_at timestamptz default now()
); 