import Link from "next/link";

const CATEGORIAS_TICKER = [
  "BARBEARIAS", "CONSTRUTORAS", "ACADEMIAS", "SORVETERIAS", "AÇAÍTERIAS",
  "CLÍNICAS", "SALÕES", "RESTAURANTES", "OFICINAS", "PET SHOPS", "HOTÉIS",
  "COWORKINGS", "PÍZZARIAS", "ÓTICAS", "FLORICULTURAS",
];

const PASSOS = [
  {
    n: "01",
    titulo: "Escaneie qualquer cidade",
    desc: "Digite uma cidade e escolha entre dezenas de categorias. O radar varre o mapa mundial em segundos e traz empresas reais da região.",
  },
  {
    n: "02",
    titulo: "Qualificação automática",
    desc: "Cada lead recebe um score: sem site, tem Instagram, tem e-mail, tem telefone. Os sem site — seu cliente ideal — sobem direto pro topo.",
  },
  {
    n: "03",
    titulo: "IA escreve, você envia",
    desc: "Mensagem personalizada para cada empresa, no idioma do país, com seu nome e seu diferencial. Envie por e-mail ou abra a DM com um clique.",
  },
];

const FEATURES = [
  {
    tag: "SCORE",
    titulo: "Leads quentes, mornos e frios",
    desc: "Quente (70+), morno (40–69), frio (<40). O lead perfeito pra quem vende site é o que não tem site — e o sistema sabe disso.",
  },
  {
    tag: "IDIOMA",
    titulo: "Fala a língua do cliente",
    desc: "Português, inglês, espanhol, francês, alemão, italiano, holandês… A mensagem sai nativa, não traduzida.",
  },
  {
    tag: "DADOS",
    titulo: "Contato completo",
    desc: "E-mail, Instagram, telefone, endereço e localização exata no mapa. Tudo organizado por empresa.",
  },
  {
    tag: "FUNIL",
    titulo: "CRM embutido",
    desc: "Novo → mensagem gerada → enviado → respondido → cliente. Marque o progresso, filtre e nunca perca um lead de vista.",
  },
  {
    tag: "E-MAIL",
    titulo: "Envio automático",
    desc: "Dispare o e-mail sem sair do painel, com log de envio e limite anti-spam. A DM do Instagram fica a um clique.",
  },
  {
    tag: "MUNDIAL",
    titulo: "Planeta inteiro",
    desc: "Lisboa, Miami, Tóquio, São Paulo. Qualquer cidade, qualquer país — a base é o OpenStreetMap, viva e em crescimento.",
  },
];

function Radar({ className }: { className?: string }) {
  return (
    <div className={`radar ${className || ""}`}>
      <div className="radar-sweep" />
      <div className="crosshair-v" style={{ left: "50%", top: "6%", bottom: "6%", width: 1 }} />
      <div className="crosshair-h" style={{ top: "50%", left: "6%", right: "6%", height: 1 }} />
      <span className="blip" style={{ left: "28%", top: "34%", animationDelay: "0.6s" }} />
      <span className="blip" style={{ left: "62%", top: "22%", animationDelay: "2.1s" }} />
      <span className="blip amber" style={{ left: "70%", top: "58%", animationDelay: "1.2s" }} />
      <span className="blip" style={{ left: "38%", top: "68%", animationDelay: "3.2s" }} />
      <span className="blip" style={{ left: "55%", top: "44%", animationDelay: "4.1s" }} />
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-void relative min-h-screen">
      <div className="bg-grid pointer-events-none absolute inset-0" />

      {/* NAV */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <Radar className="h-9 w-9" />
          <span className="headline text-sm font-bold uppercase tracking-widest">
            Prospectando<span className="text-signal-glow">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#como" className="mono hidden text-xs uppercase tracking-widest text-[var(--ink-dim)] transition hover:text-[var(--signal)] sm:block">
            Como funciona
          </a>
          <a href="#recursos" className="mono hidden text-xs uppercase tracking-widest text-[var(--ink-dim)] transition hover:text-[var(--signal)] sm:block">
            Recursos
          </a>
          <Link href="/login" className="btn-signal rounded-lg px-4 py-2 text-xs uppercase tracking-widest">
            Acessar painel
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20">
        <div>
          <p className="eyebrow reveal d1 flex items-center gap-3">
            <span className="pulse-dot" /> Radar global de oportunidades
          </p>
          <h1 className="headline reveal d2 mt-6 text-4xl font-extrabold sm:text-6xl">
            Empresas no <span className="text-signal-glow">mundo inteiro</span> que ainda precisam de um site.
          </h1>
          <p className="reveal d3 mt-6 max-w-xl text-lg leading-relaxed text-[var(--ink-dim)]">
            O ProspectandoAI varre o mapa mundial, encontra negócios reais por cidade e categoria,
            descobre quais <strong className="text-[var(--ink)]">não têm site</strong> e escreve a
            abordagem perfeita com IA — no idioma de cada país.
          </p>
          <div className="reveal d4 mt-9 flex flex-wrap items-center gap-4">
            <Link href="/login" className="btn-signal rounded-xl px-7 py-3.5 text-sm uppercase tracking-widest">
              Começar agora — grátis
            </Link>
            <a href="#como" className="btn-ghost mono rounded-xl px-7 py-3.5 text-xs uppercase tracking-widest">
              Ver como funciona
            </a>
          </div>
          <div className="reveal d5 mono mt-12 grid max-w-lg grid-cols-3 gap-6 text-xs">
            <div>
              <p className="text-2xl font-semibold text-[var(--signal)]">195</p>
              <p className="mt-1 uppercase tracking-widest text-[var(--ink-faint)]">países no radar</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--signal)]">20+</p>
              <p className="mt-1 uppercase tracking-widest text-[var(--ink-faint)]">categorias</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--signal)]">7</p>
              <p className="mt-1 uppercase tracking-widest text-[var(--ink-faint)]">idiomas nativos</p>
            </div>
          </div>
        </div>

        {/* Radar hero */}
        <div className="reveal d3 relative mx-auto hidden aspect-square w-full max-w-md lg:block">
          <div className="float-slow">
            <Radar className="aspect-square w-full" />
          </div>
          <p className="mono absolute -left-4 top-8 text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
            varrendo · lisboa 38.72°N 9.14°W
          </p>
          <p className="mono absolute -right-2 bottom-10 text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
            87 contatos · 27 sem site
          </p>
          <p className="mono absolute -bottom-6 left-10 text-[10px] uppercase tracking-widest text-[var(--signal-dim)]">
            alvo travado: aspectus · score 80
          </p>
        </div>
      </section>

      {/* TICKER */}
      <section className="relative z-10 border-y border-[var(--line)] bg-[var(--deep)]/60 py-4 backdrop-blur">
        <div className="overflow-hidden">
          <div className="ticker-track">
            {[...CATEGORIAS_TICKER, ...CATEGORIAS_TICKER].map((c, i) => (
              <span key={i} className="mono flex items-center gap-3.5 text-xs tracking-widest text-[var(--ink-dim)]">
                {c} <span className="text-[var(--signal-dim)]">◦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="relative z-10 mx-auto max-w-6xl px-5 py-28">
        <p className="eyebrow reveal">Protocolo de caça</p>
        <h2 className="headline reveal d1 mt-4 text-3xl font-bold sm:text-5xl">
          Três movimentos.<br />Zero <span className="outline-text">achismo</span>.
        </h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PASSOS.map((p, i) => (
            <div key={p.n} className={`panel panel-hover reveal d${i + 2} relative overflow-hidden rounded-2xl p-7`}>
              <span className="mono absolute -right-3 -top-6 text-[92px] font-bold leading-none text-[var(--line-strong)]">
                {p.n}
              </span>
              <h3 className="headline relative text-lg font-semibold">{p.titulo}</h3>
              <p className="relative mt-4 text-sm leading-relaxed text-[var(--ink-dim)]">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SCORE VISUAL */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-28">
        <div className="panel reveal overflow-hidden rounded-3xl">
          <div className="grid lg:grid-cols-2">
            <div className="p-9 lg:p-12">
              <p className="eyebrow">O algoritmo do lead perfeito</p>
              <h2 className="headline mt-4 text-2xl font-bold sm:text-3xl">
                Cada empresa vira um score de 0 a 100.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-[var(--ink-dim)]">
                O critério é brutalmente honesto: para quem vende site, o melhor lead é o que
                <strong className="text-[var(--ink)]"> ainda não tem um</strong>. O ranking faz o
                trabalho sujo — você só ataca o topo da lista.
              </p>
              <div className="mono mt-8 flex flex-wrap gap-3 text-[10px] uppercase tracking-widest">
                <span className="badge border-[var(--alert)]/50 text-[var(--alert)]">🔥 quente · 70+</span>
                <span className="badge border-[var(--amber)]/50 text-[var(--amber)]">morno · 40–69</span>
                <span className="badge border-[var(--line-strong)] text-[var(--ink-dim)]">frio · &lt;40</span>
              </div>
            </div>
            <div className="border-t border-[var(--line)] p-9 lg:border-l lg:border-t-0 lg:p-12">
              {[
                { label: "Sem website", peso: "+40", w: "100%", cor: "var(--signal)" },
                { label: "Tem Instagram", peso: "+20", w: "50%", cor: "#8b5cf6" },
                { label: "Tem e-mail", peso: "+20", w: "50%", cor: "#38bdf8" },
                { label: "Tem telefone", peso: "+10", w: "25%", cor: "var(--amber)" },
                { label: "Endereço completo", peso: "+10", w: "25%", cor: "var(--ink-dim)" },
              ].map((r) => (
                <div key={r.label} className="mb-4 last:mb-0">
                  <div className="mono mb-1.5 flex justify-between text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">
                    <span>{r.label}</span>
                    <span className="text-[var(--ink)]">{r.peso}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: r.w, background: r.cor, boxShadow: `0 0 12px ${r.cor}` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="relative z-10 mx-auto max-w-6xl px-5 pb-28">
        <p className="eyebrow reveal">Arsenal completo</p>
        <h2 className="headline reveal d1 mt-4 text-3xl font-bold sm:text-5xl">
          Tudo que a caça exige.
        </h2>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.titulo} className={`panel panel-hover reveal d${(i % 3) + 2} rounded-2xl p-7`}>
              <span className="mono text-[10px] uppercase tracking-[0.3em] text-[var(--signal)]">[{f.tag}]</span>
              <h3 className="headline mt-4 text-base font-semibold">{f.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-dim)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-32">
        <div className="reveal relative overflow-hidden rounded-3xl border border-[var(--line-strong)] bg-gradient-to-b from-[rgba(45,255,180,0.07)] to-transparent p-12 text-center lg:p-20">
          <div className="pointer-events-none absolute inset-0 flex justify-center opacity-60">
            <Radar className="aspect-square w-[560px] max-w-none opacity-30" />
          </div>
          <div className="relative">
            <p className="eyebrow justify-center">Sinal detectado</p>
            <h2 className="headline mx-auto mt-5 max-w-2xl text-3xl font-extrabold sm:text-5xl">
              Seu próximo cliente já está no mapa. <span className="text-signal-glow">Falta só você chegar lá.</span>
            </h2>
            <Link href="/login" className="btn-signal mt-10 inline-block rounded-xl px-9 py-4 text-sm uppercase tracking-widest">
              Abrir o radar — grátis
            </Link>
            <p className="mono mt-5 text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
              sem cartão de crédito · dados abertos do openstreetmap
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[var(--line)] py-8">
        <div className="mono mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
          <span>ProspectandoAI © 2026</span>
          <span>dados · openstreetmap contributors</span>
          <span className="flex items-center gap-2"><span className="pulse-dot" /> sistema operacional</span>
        </div>
      </footer>
    </main>
  );
}
