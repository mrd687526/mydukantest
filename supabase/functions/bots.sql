create table if not exists bots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  connected_account_id uuid,
  status text not null default 'inactive',
  flow_data jsonb,
  settings jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
); 