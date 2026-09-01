-- RTPL — Round Table Premier League, Season 8
-- Team owner registration.
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL -> New query).
--
-- The columns mirror the six questions on the registration form one-for-one.
-- If an earlier version of this table exists, drop it first — the shape and
-- the name have both changed (it used to be team_registrations):
--     drop table if exists public.team_registrations cascade;
--     drop table if exists public.owner_registrations cascade;

create table if not exists public.owner_registrations (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),

  -- Entry reference shown back to the owner, e.g. RTPL5-4813
  reference              text not null,

  -- "Name of Owners with Table No"  (required)
  owners                 text not null,
  -- "Mobile Number of the Owners"
  owners_mobile          text not null,
  -- "Proposed Team Name"
  team_name              text not null,

  -- "T-Shirt sizes" — one of S/M/L/XL/XXL, or Other with free text
  tshirt_size            text,
  tshirt_size_other      text,

  -- "Owning a RTPL team involves a financial commitment, are you willing to
  --  fulfill that and timely? (Tentative fees is Rs.1.50 Lakhs)"
  financial_commitment   text not null,

  -- "Auction Date would be 13th December, please share your availability."
  auction_availability   text not null,

  -- Workflow
  status                 text not null default 'pending'
                         check (status in ('pending', 'confirmed', 'waitlisted', 'rejected')),

  constraint owner_registrations_reference_check
    check (reference ~ '^RTPL[0-9]+-[0-9]{4}$'),
  constraint owner_registrations_tshirt_size_check
    check (tshirt_size is null
           or tshirt_size in ('S', 'M', 'L', 'XL', 'XXL', 'Other')),
  -- Free text is only meaningful alongside the Other option.
  constraint owner_registrations_tshirt_other_check
    check (tshirt_size_other is null or tshirt_size = 'Other'),
  constraint owner_registrations_financial_check
    check (financial_commitment in ('Yes', 'No')),
  constraint owner_registrations_auction_check
    check (auction_availability in ('Yes', 'No', 'Maybe'))
);

-- One entry per proposed team name (case-insensitive), so a double submit
-- does not take two slots.
create unique index if not exists owner_registrations_team_name_key
  on public.owner_registrations (lower(team_name));

create unique index if not exists owner_registrations_reference_key
  on public.owner_registrations (reference);

create index if not exists owner_registrations_created_at_idx
  on public.owner_registrations (created_at desc);

-- Row level security -------------------------------------------------------
alter table public.owner_registrations enable row level security;

-- Prospective owners can submit an entry...
drop policy if exists "anon can register as an owner" on public.owner_registrations;
create policy "anon can register as an owner"
  on public.owner_registrations
  for insert
  to anon
  with check (
    status = 'pending'
    and char_length(owners)        between 2 and 400
    and char_length(owners_mobile) between 6 and 120
    and char_length(team_name)     between 2 and 80
    and char_length(coalesce(tshirt_size_other, '')) <= 60
  );

-- ...but cannot read anyone's entries back. Organisers read them from the
-- Supabase dashboard, or through an authenticated admin view.
drop policy if exists "authenticated organisers can read entries" on public.owner_registrations;
create policy "authenticated organisers can read entries"
  on public.owner_registrations
  for select
  to authenticated
  using (true);
