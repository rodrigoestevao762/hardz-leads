-- HardZ Leads — schema v1
-- Cole e rode este script no SQL Editor do seu projeto Supabase.

-- Tipos
create type lead_status as enum ('novo', 'mensagem_gerada', 'enviado', 'respondido', 'cliente');
create type lead_channel as enum ('email', 'dm');
create type lead_level as enum ('quente', 'morno', 'frio');

-- Leads do usuário
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  categoria text not null,
  cidade text not null,
  pais text not null default '',
  lat double precision,
  lng double precision,
  telefone text,
  website text,
  instagram text,
  email text,
  fonte text not null default 'osm',
  osm_id text,
  score int not null default 0,
  nivel lead_level not null default 'frio',
  status lead_status not null default 'novo',
  canal lead_channel,
  notas text default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (user_id, osm_id)
);

-- Mensagens geradas/enviadas
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  canal text not null default 'email',
  texto text not null,
  status text not null default 'gerada', -- gerada | enviada | erro
  erro text,
  criado_em timestamptz not null default now()
);

-- Configurações do negócio do usuário (usadas na personalização)
create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  negocio_nome text not null default 'HardZ Sites',
  servico text not null default 'Criação de sites profissionais',
  diferenciais text not null default 'Site próprio que aparece no Google, agendamento integrado, entrega rápida',
  remetente_email text,
  resend_api_key text
);

-- RLS: cada usuário só acessa o que é dele
alter table public.leads enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;

create policy "leads próprios" on public.leads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mensagens próprias" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "settings próprias" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Índices
create index leads_user_status on public.leads (user_id, status);
create index leads_user_categoria on public.leads (user_id, categoria);
create index messages_lead on public.messages (lead_id);
