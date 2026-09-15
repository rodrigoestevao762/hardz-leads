-- Limpeza: remove objetos do HardZ Leads criados por engano no barber-pro
-- Rode no SQL Editor do projeto BARBER-PRO.
-- Atenção: só rode se o barber-pro NÃO tiver tabelas próprias com esses nomes.

drop table if exists public.messages cascade;
drop table if exists public.leads cascade;
drop table if exists public.settings cascade;
drop type if exists lead_status cascade;
drop type if exists lead_channel cascade;
drop type if exists lead_level cascade;
