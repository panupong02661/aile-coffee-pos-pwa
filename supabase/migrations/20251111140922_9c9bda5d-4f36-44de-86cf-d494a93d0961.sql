-- Enable RLS on shop_settings and add permissive policies similar to other tables
-- Safe guards: create policies only if they don't already exist

-- Ensure RLS is enabled
alter table if exists public.shop_settings enable row level security;

-- Anyone can view shop settings
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'shop_settings' and policyname = 'Anyone can view shop settings'
  ) then
    create policy "Anyone can view shop settings"
    on public.shop_settings
    for select
    using (true);
  end if;
end $$;

-- Allow all operations on shop_settings (matches many existing tables in this project)
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'shop_settings' and policyname = 'Allow all operations on shop_settings'
  ) then
    create policy "Allow all operations on shop_settings"
    on public.shop_settings
    for all
    using (true)
    with check (true);
  end if;
end $$;
