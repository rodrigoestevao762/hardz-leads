-- Publicação de landings (hospedagem grátis) — idempotente, rodar 1x no SQL Editor
-- (não apaga nada; só adiciona colunas e policy na tabela landings)

alter table public.landings add column if not exists slug text;
alter table public.landings add column if not exists publicada boolean not null default false;
alter table public.landings add column if not exists dados jsonb not null default '{}';

create unique index if not exists landings_slug_unico on public.landings (slug);

-- leitura pública: qualquer pessoa (anon) pode ver landings publicadas
drop policy if exists "leitura publica landings publicadas" on public.landings;
create policy "leitura publica landings publicadas" on public.landings
  for select using (publicada = true);
