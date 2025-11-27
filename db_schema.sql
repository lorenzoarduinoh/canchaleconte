-- Create Matches Table
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  date date not null,
  time text not null,
  price_per_player numeric not null,
  max_players integer not null,
  location_link text,
  status text default 'Abierto',
  result text,
  mvp text,
  comments text
);

-- Create Players Table
create table public.players (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  match_id uuid references public.matches(id) on delete cascade not null,
  name text not null,
  phone text,
  has_paid boolean default false,
  payment_method text
);

-- Set up Row Level Security (RLS)
-- For simplicity in this phase, we allow public access. 
-- In production, you would restrict 'insert/update/delete' to authenticated users (Santiago & Agustín).

alter table public.matches enable row level security;
alter table public.players enable row level security;

create policy "Allow public read access"
on public.matches for select
to public
using (true);

create policy "Allow public insert access (Temporary)"
on public.matches for insert
to public
with check (true);

create policy "Allow public update access (Temporary)"
on public.matches for update
to public
using (true);

create policy "Allow public delete access (Temporary)"
on public.matches for delete
to public
using (true);

-- Players policies
create policy "Allow public read access"
on public.players for select
to public
using (true);

create policy "Allow public insert access"
on public.players for insert
to public
with check (true);

create policy "Allow public update access"
on public.players for update
to public
using (true);

create policy "Allow public delete access"
on public.players for delete
to public
using (true);
