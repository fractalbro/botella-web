-- Botella web · registro de la landing.
-- Pegar completo en Supabase > SQL Editor y Run. Se puede volver a correr sin problema.
-- La web solo puede llamar a dos funciones; nadie puede leer la lista desde afuera.

create table if not exists public.waitlist_config (
  id boolean primary key default true check (id),
  cap int not null default 100,          -- cuántas personas reciben el acceso al toque
  code text not null default 'BOTELLA-01', -- código que se entrega
  app_url text not null default 'https://botella-app.vercel.app'
);
insert into public.waitlist_config(id) values (true) on conflict do nothing;
alter table public.waitlist_config enable row level security;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 60),
  phone text not null unique check (phone ~ '^\+?[0-9]{8,15}$'),
  district text check (char_length(district) <= 40),
  ref text check (char_length(ref) <= 40),       -- quién compartió el link (?de=...)
  source text check (char_length(source) <= 40), -- whatsapp, persona, instagram...
  granted boolean not null default false,        -- recibió el link de acceso
  invite text not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8) unique, -- su propio link para invitar
  notes text
);
alter table public.waitlist enable row level security; -- sin políticas: solo se ve desde el panel

create or replace function public.join_waitlist(p_name text, p_phone text, p_district text default null, p_ref text default null, p_source text default null)
returns json language plpgsql security definer set search_path = public as $$
declare
  c waitlist_config;
  ph text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  w waitlist;
  used int;
begin
  select * into c from waitlist_config limit 1;
  if char_length(trim(coalesce(p_name, ''))) = 0 then raise exception 'name'; end if;
  -- Perú: 9 dígitos que empiezan en 9 -> +51
  if ph ~ '^9[0-9]{8}$' then ph := '+51' || ph; end if;
  if ph !~ '^\+' and char_length(ph) >= 10 then ph := '+' || ph; end if;
  if ph !~ '^\+[0-9]{8,15}$' then raise exception 'phone'; end if;

  select * into w from waitlist where phone = ph;
  if not found then
    select count(*) into used from waitlist where granted;
    insert into waitlist(name, phone, district, ref, source, granted)
    values (left(trim(p_name), 60), ph, left(nullif(trim(p_district), ''), 40), left(nullif(trim(p_ref), ''), 40), left(nullif(trim(p_source), ''), 40), used < c.cap)
    returning * into w;
  end if;

  return json_build_object(
    'granted', w.granted,
    'name', left(trim(p_name), 60),
    'invite', w.invite,
    'code', case when w.granted then c.code end,
    'link', case when w.granted then c.app_url || '/?c=' || c.code end,
    'place', (select count(*) from waitlist x where x.granted = w.granted and x.created_at <= w.created_at)
  );
end $$;

create or replace function public.waitlist_left() returns int language sql stable security definer set search_path = public as $$
  select greatest(0, (select cap from waitlist_config limit 1) - (select count(*)::int from waitlist where granted));
$$;

revoke all on function public.join_waitlist(text, text, text, text, text) from public;
grant execute on function public.join_waitlist(text, text, text, text, text) to anon, authenticated;
grant execute on function public.waitlist_left() to anon, authenticated;

-- Útil desde el panel:
-- select created_at, name, phone, district, ref, granted from waitlist order by created_at desc;
-- update waitlist_config set cap = 150;                       -- abrir más lugares
-- update waitlist set granted = true where phone = '+51...';  -- dar acceso a alguien de la lista de espera
