-- 1. Drop all policies on bots
do $$
declare
  r record;
begin
  for r in (select policyname from pg_policies where tablename = 'bots') loop
    execute format('drop policy if exists "%s" on bots;', r.policyname);
  end loop;
end $$;

-- 2. Drop the profile_id column (if it exists)
alter table bots drop column if exists profile_id cascade;

-- 3. Ensure the bots table schema matches the recommended structure
-- (This will not drop columns, but you can manually drop any extra columns if needed)
alter table bots
  alter column connected_account_id drop not null;

-- Add columns if missing (no-op if they exist)
alter table bots add column if not exists flow_data jsonb;
alter table bots add column if not exists settings jsonb;
alter table bots add column if not exists created_at timestamptz default now();
alter table bots add column if not exists updated_at timestamptz default now(); 