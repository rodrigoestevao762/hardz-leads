# HardZ Leads

SaaS de prospecção mundial: busca empresas por cidade/categoria (OpenStreetMap), qualifica leads automaticamente (sem site = quente), gera mensagens individuais com IA gratuita (Gemini) e controla o funil (e-mail automático via Resend + DM do Instagram semiautomática).

## Stack
Next.js 15 + TypeScript + Tailwind 4 · Supabase (auth + Postgres + RLS) · Vercel

## Setup em 8 passos

1. **Supabase** — crie um projeto em [supabase.com](https://supabase.com). Abra *SQL Editor*, cole o conteúdo de `supabase/schema.sql` e rode.
2. **Chaves Supabase** — em *Project Settings > API*, copie a URL e a anon key.
3. **Gemini grátis** — em [aistudio.google.com](https://aistudio.google.com), crie uma API key.
4. **Resend grátis** — em [resend.com](https://resend.com), crie uma API key (100 e-mails/dia grátis).
5. **Variáveis** — copie `.env.example` para `.env.local` e preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   GEMINI_API_KEY=...
   RESEND_API_KEY=...        (opcional: pode configurar no painel, aba Configurações)
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
6. **Rodar** — `npm install` e `npm run dev` → http://localhost:3000
7. **Login Google (opcional)** — no Supabase, habilite o provider Google (*Authentication > Providers*) e no Google Cloud Console configure o redirect `https://SEU-PROJETO.supabase.co/auth/v1/callback`. Sem isso, use e-mail/senha.
8. **Deploy Vercel** — suba o repositório para o GitHub, importe na Vercel e adicione as mesmas variáveis de ambiente. Domínio da Hostinger: aponte o registro CNAME/A conforme a Vercel indicar (*Project > Settings > Domains*).

## Como usar
1. **Buscar empresas**: cidade + categoria → resultados ordenados por qualificação → salvar os melhores
2. **Qualificação automática**: sem site (+40) · Instagram (+20) · e-mail (+20) · telefone (+10) · endereço (+10) → Quente (70+), Morno (40–69), Frio (<40)
3. **Gerar mensagem**: IA escreve no idioma do país usando os dados da aba Configurações; botão copiar
4. **E-mail**: preencha a chave Resend nas Configurações e clique "Enviar e-mail" (limite 80/dia anti-spam)
5. **DM Instagram**: "Abrir DM" copia a mensagem e abre o chat — você só cola e envia

## Próximas fases
- Mapa mundial interativo (clicar cidade → empresas)
- Gerador de landing pages por template + IA
- Enriquecimento opcional via Google Places
