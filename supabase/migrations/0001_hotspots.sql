-- ═══════════════════════════════════════════════════
-- EXTENSIONS
-- ═══════════════════════════════════════════════════
create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- ═══════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_language text default 'en',
  preferred_state_code text check (char_length(preferred_state_code) = 2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (user_id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (user_id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (user_id = auth.uid());

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════════════════
-- ROLES
-- ═══════════════════════════════════════════════════
create table if not exists public.roles (
  id smallserial primary key,
  name text unique not null
);

insert into public.roles (name)
values ('user'), ('researcher'), ('admin')
on conflict (name) do nothing;

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id smallint not null references public.roles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, role_id)
);

alter table public.user_roles enable row level security;

-- role helper function
create or replace function public.has_role(role_name text)
returns boolean
language sql stable security definer as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = role_name
  );
$$;

create policy "user_roles_admin_only"
  on public.user_roles for select
  using (public.has_role('admin'));

-- ═══════════════════════════════════════════════════
-- ANALYTICS TABLES (no PII)
-- ═══════════════════════════════════════════════════

-- SCAN EVENTS
create table if not exists public.scan_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  state_code char(2),
  geohash_5 char(5),

  vehicle_type text check (vehicle_type in ('2W','3W','4W','LMV','HMV','transport','non_transport','all')),

  charged_total_inr integer check (charged_total_inr >= 0 and charged_total_inr <= 10000000),
  legal_total_inr integer check (legal_total_inr >= 0 and legal_total_inr <= 10000000),
  overcharge_total_inr integer check (overcharge_total_inr >= 0 and overcharge_total_inr <= 10000000),

  status text not null check (status in ('correct','overcharged','undercharged','unverified')),
  confidence text check (confidence in ('high','medium','low')),

  violation_ids text[] check (array_length(violation_ids, 1) <= 10),
  sections text[] check (array_length(sections, 1) <= 10),

  pack_id text check (char_length(pack_id) <= 50),
  pack_version text check (char_length(pack_version) <= 20)
);

create index if not exists scan_events_created_idx
  on public.scan_events (created_at desc);
create index if not exists scan_events_state_idx
  on public.scan_events (state_code);
create index if not exists scan_events_geohash_idx
  on public.scan_events (geohash_5);
create index if not exists scan_events_status_idx
  on public.scan_events (status);
create index if not exists scan_events_violation_ids_gin
  on public.scan_events using gin (violation_ids);

alter table public.scan_events enable row level security;

create policy "scan_events_admin_read"
  on public.scan_events for select
  using (public.has_role('admin') or public.has_role('researcher'));

-- No direct inserts from client
revoke insert, update, delete
  on public.scan_events from anon, authenticated;

-- CALC EVENTS
create table if not exists public.calc_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  state_code char(2),
  geohash_5 char(5),

  vehicle_type text check (vehicle_type in ('2W','3W','4W','LMV','HMV','transport','non_transport','all')),
  violation_id text check (char_length(violation_id) <= 200),
  section text check (char_length(section) <= 50),
  category text check (char_length(category) <= 50),
  severity smallint check (severity between 1 and 5),
  applied_fine_inr integer check (applied_fine_inr >= 0 and applied_fine_inr <= 500000),

  pack_id text check (char_length(pack_id) <= 50),
  pack_version text check (char_length(pack_version) <= 20),
  source text check (source in ('manual','nlp')) default 'manual'
);

create index if not exists calc_events_created_idx
  on public.calc_events (created_at desc);
create index if not exists calc_events_state_idx
  on public.calc_events (state_code);
create index if not exists calc_events_violation_idx
  on public.calc_events (violation_id);

alter table public.calc_events enable row level security;

create policy "calc_events_admin_read"
  on public.calc_events for select
  using (public.has_role('admin') or public.has_role('researcher'));

revoke insert, update, delete
  on public.calc_events from anon, authenticated;

-- ASK EVENTS
create table if not exists public.ask_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  state_code char(2),
  geohash_5 char(5),
  language char(2) default 'en',

  intent_confidence numeric(4,3) check (
    intent_confidence >= 0 and intent_confidence <= 1
  ),
  resolved_offline boolean default false,
  matched_violation_ids text[] check (
    array_length(matched_violation_ids, 1) <= 10
  )
);

create index if not exists ask_events_created_idx
  on public.ask_events (created_at desc);
create index if not exists ask_events_state_idx
  on public.ask_events (state_code);

alter table public.ask_events enable row level security;

create policy "ask_events_admin_read"
  on public.ask_events for select
  using (public.has_role('admin') or public.has_role('researcher'));

revoke insert, update, delete
  on public.ask_events from anon, authenticated;

-- ═══════════════════════════════════════════════════
-- HOTSPOTS
-- ═══════════════════════════════════════════════════
create table if not exists public.hotspots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null,

  state_code char(2),
  geohash_6 char(6) not null,

  type text not null check (type in (
    'overcharging','frequent_checks',
    'unclear_signage','dangerous_spot','other'
  )),
  description text check (char_length(description) <= 300),

  upvotes integer default 0 check (upvotes >= 0),
  downvotes integer default 0 check (downvotes >= 0),
  reports_count integer default 0 check (reports_count >= 0),
  trust_score numeric(6,2) default 0,
  is_active boolean default true
);

create index if not exists hotspots_state_idx
  on public.hotspots (state_code);
create index if not exists hotspots_geohash6_idx
  on public.hotspots (geohash_6);
create index if not exists hotspots_active_idx
  on public.hotspots (is_active);

alter table public.hotspots enable row level security;

-- Admin can read full table
create policy "hotspots_admin_read"
  on public.hotspots for select
  using (public.has_role('admin') or public.has_role('researcher'));

-- Admin can update (moderation)
create policy "hotspots_admin_update"
  on public.hotspots for update
  using (public.has_role('admin'));

-- No direct inserts from client (edge function only)
revoke insert, delete on public.hotspots from anon, authenticated;

-- HOTSPOT VOTES
create table if not exists public.hotspot_votes (
  hotspot_id uuid not null references public.hotspots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)),
  created_at timestamptz default now(),
  primary key (hotspot_id, user_id)
);

alter table public.hotspot_votes enable row level security;

create policy "hotspot_votes_auth_insert"
  on public.hotspot_votes for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "hotspot_votes_auth_read"
  on public.hotspot_votes for select
  using (auth.uid() is not null);

-- HOTSPOT REPORTS (abuse)
create table if not exists public.hotspot_reports (
  id uuid primary key default gen_random_uuid(),
  hotspot_id uuid not null references public.hotspots(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reason text check (char_length(reason) <= 200),
  created_at timestamptz default now()
);

alter table public.hotspot_reports enable row level security;

create policy "hotspot_reports_auth_insert"
  on public.hotspot_reports for insert
  with check (auth.uid() is not null);

create policy "hotspot_reports_admin_read"
  on public.hotspot_reports for select
  using (public.has_role('admin'));

-- Auto-deactivate hotspot on 5+ reports
create or replace function public.check_hotspot_reports()
returns trigger language plpgsql security definer as $$
begin
  update public.hotspots
  set is_active = false,
      reports_count = reports_count + 1
  where id = new.hotspot_id
    and (
      select count(*) from public.hotspot_reports
      where hotspot_id = new.hotspot_id
    ) >= 5;

  -- Always increment count
  update public.hotspots
  set reports_count = reports_count + 1
  where id = new.hotspot_id
    and (
      select count(*) from public.hotspot_reports
      where hotspot_id = new.hotspot_id
    ) < 5;

  return new;
end;
$$;

create trigger hotspot_report_trigger
  after insert on public.hotspot_reports
  for each row execute function public.check_hotspot_reports();

-- Trust score recompute
create or replace function public.recompute_hotspot_score(hid uuid)
returns void language plpgsql security definer as $$
declare
  u integer; d integer; r integer;
  score numeric;
begin
  select upvotes, downvotes, reports_count
  into u, d, r
  from public.hotspots
  where id = hid;

  if not found then return; end if;

  score := ln(1 + greatest(u, 0))
         - ln(1 + greatest(d, 0))
         - (0.5 * greatest(r, 0));

  update public.hotspots
  set trust_score = score
  where id = hid;
end;
$$;

-- Vote triggers (upvotes/downvotes)
create or replace function public.handle_hotspot_vote()
returns trigger language plpgsql security definer as $$
begin
  if new.vote = 1 then
    update public.hotspots set upvotes = upvotes + 1 where id = new.hotspot_id;
  else
    update public.hotspots set downvotes = downvotes + 1 where id = new.hotspot_id;
  end if;
  perform public.recompute_hotspot_score(new.hotspot_id);
  return new;
end;
$$;

create trigger hotspot_vote_trigger
  after insert on public.hotspot_votes
  for each row execute function public.handle_hotspot_vote();

-- ═══════════════════════════════════════════════════
-- PUBLIC SAFE VIEW (aggregated to geohash_5)
-- ═══════════════════════════════════════════════════
create or replace view public.v_hotspots_public as
select
  left(geohash_6, 5) as geohash_5,
  state_code,
  type,
  count(*) as hotspot_count,
  round(avg(trust_score), 2) as avg_trust_score,
  sum(upvotes) as total_upvotes,
  sum(downvotes) as total_downvotes
from public.hotspots
where is_active = true
group by 1, 2, 3;

grant select on public.v_hotspots_public to anon, authenticated;

-- ═══════════════════════════════════════════════════
-- MATERIALIZED VIEWS (portal analytics)
-- ═══════════════════════════════════════════════════

-- 1. Top overcharged violations monthly
create materialized view if not exists public.mv_top_overcharged_monthly as
select
  date_trunc('month', created_at) as month,
  state_code,
  unnest(violation_ids) as violation_id,
  count(*) as scans_count,
  sum(coalesce(overcharge_total_inr, 0)) as total_overcharge_inr,
  avg(coalesce(overcharge_total_inr, 0)) as avg_overcharge_inr
from public.scan_events
where status = 'overcharged'
group by 1, 2, 3;

create unique index if not exists mv_top_overcharged_uniq
  on public.mv_top_overcharged_monthly (month, state_code, violation_id);

grant select on public.mv_top_overcharged_monthly to anon, authenticated;

-- 2. Compliance index monthly
create materialized view if not exists public.mv_compliance_index_monthly as
select
  date_trunc('month', created_at) as month,
  state_code,
  count(*) filter (where status = 'correct') as correct_count,
  count(*) filter (
    where status in ('overcharged', 'undercharged')
  ) as incorrect_count,
  count(*) filter (
    where status in ('correct', 'overcharged', 'undercharged')
  ) as total_verified,
  case
    when count(*) filter (
      where status in ('correct', 'overcharged', 'undercharged')
    ) = 0 then 0
    else round(
      count(*) filter (where status = 'correct')::numeric /
      count(*) filter (
        where status in ('correct', 'overcharged', 'undercharged')
      )::numeric,
      4
    )
  end as compliance_index
from public.scan_events
group by 1, 2;

create unique index if not exists mv_compliance_uniq
  on public.mv_compliance_index_monthly (month, state_code);

grant select on public.mv_compliance_index_monthly to anon, authenticated;

-- 3. Overcharge heatmap by geohash
create materialized view if not exists public.mv_overcharge_heatmap_monthly as
select
  date_trunc('month', created_at) as month,
  state_code,
  geohash_5,
  count(*) as scans_count,
  sum(coalesce(overcharge_total_inr, 0)) as total_overcharge_inr,
  avg(coalesce(overcharge_total_inr, 0)) as avg_overcharge_inr
from public.scan_events
where status = 'overcharged'
  and geohash_5 is not null
group by 1, 2, 3;

create unique index if not exists mv_heatmap_uniq
  on public.mv_overcharge_heatmap_monthly (month, state_code, geohash_5);

grant select on public.mv_overcharge_heatmap_monthly to anon, authenticated;

-- Refresh function (admin triggers this)
create or replace function public.refresh_portal_views()
returns void language plpgsql security definer as $$
begin
  refresh materialized view concurrently public.mv_top_overcharged_monthly;
  refresh materialized view concurrently public.mv_compliance_index_monthly;
  refresh materialized view concurrently public.mv_overcharge_heatmap_monthly;
end;
$$;

-- ═══════════════════════════════════════════════════
-- SEED MOCK DATA (Portal looks live on day one)
-- ═══════════════════════════════════════════════════
do $$
declare
  states text[] := array['DL','KA','TN','MH','UP'];
  statuses text[] := array['correct','overcharged','undercharged','unverified'];
  vids text[] := array[
    'IN::Section-194D::helmet-not-worn',
    'IN::Section-194B::seatbelt-not-worn',
    'IN::Section-185::drunk-driving',
    'IN::Section-177A::signal-violation',
    'IN::Section-196::no-insurance'
  ];
  i integer;
  s text;
  v text;
  st text;
  mo timestamptz;
begin
  for i in 1..500 loop
    s := states[1 + floor(random() * 5)::int];
    v := vids[1 + floor(random() * 5)::int];
    st := statuses[1 + floor(random() * 4)::int];
    mo := now() - (floor(random() * 6)::int || ' months')::interval;

    insert into public.scan_events (
      created_at, state_code, geohash_5,
      vehicle_type, charged_total_inr, legal_total_inr,
      overcharge_total_inr, status, confidence,
      violation_ids, sections, pack_id, pack_version
    ) values (
      mo,
      s,
      substring(md5(s || i::text), 1, 5),
      (array['2W','4W','HMV'])[1 + floor(random()*3)::int],
      1000 + (floor(random() * 4000))::int,
      1000,
      case when st = 'overcharged' then 200 + (floor(random()*800))::int else 0 end,
      st,
      (array['high','medium','low'])[1 + floor(random()*3)::int],
      array[v],
      array['Section 194D'],
      'IN-central',
      '1.0.0'
    );
  end loop;
end;
$$;

-- Refresh MVs after seeding
select public.refresh_portal_views();
