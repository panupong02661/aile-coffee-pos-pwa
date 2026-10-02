create extension if not exists pgcrypto;

-- Hash legacy plain-text staff passwords (sha256 base64 of password+salt, matching the staff-auth edge function)
update public.users u
set password_salt = s.salt,
    password_hash = encode(digest(u.password_hash || s.salt, 'sha256'), 'base64')
from (
  select id, encode(gen_random_bytes(16), 'hex') as salt
  from public.users
  where password_salt is null
) s
where u.id = s.id;

-- Idempotency flag for offline order side effects (notifications, stock, points, queue)
alter table public.orders add column if not exists side_effects_done boolean not null default false;

-- Existing orders already had their side effects applied
update public.orders set side_effects_done = true where side_effects_done = false;