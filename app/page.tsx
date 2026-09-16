import Link from "next/link";

const TICKER = [
  { label: "BARBEARIAS", icon: "✂" }, { label: "RESTAURANTES", icon: "🍽" },
  { label: "ACADEMIAS", icon: "⚡" }, { label: "CLÍNICAS", icon: "💊" },
  { label: "SALÕES", icon: "💅" }, { label: "OFICINAS", icon: "🔧" },
  { label: "PET SHOPS", icon: "🐾" }, { label: "HOTÉIS", icon: "🏨" },
  { label: "PIZZARIAS", icon: "🍕" }, { label: "FLORICULTURAS", icon: "🌸" },
  { label: "ÓTICAS", icon: "👁" }, { label: "COWORKINGS", icon: "💻" },
  { label: "AÇAÍTERIAS", icon: "🫐" }, { label: "SORVETERIAS", icon: "🍦" },
];

const PASSOS = [
  {
    n: "01",
    icon: "⟁",
    titulo: "Escaneie qualquer cidade",
    desc: "Digite uma cidade e escolha entre dezenas de categorias. O radar varre o mapa mundial em segundos e traz empresas reais com coordenadas precisas.",
    cor: "var(--signal)",
  },
  {
    n: "02",
    icon: "◎",
    titulo: "Qualificação automática",
    desc: "Cada lead recebe um score de 0–100. Sem site = +40 pts. Com Instagram = +20. Os alvos perfeitos sobem automaticamente pro topo.",
    cor: "#8b5cf6",
  },
  {
    n: "03",
    icon: "↗",
    titulo: "IA escreve, você fecha",
    desc: "Mensagem personalizada para cada empresa, no idioma do país, com seu nome e diferencial. Disparo por e-mail ou DM com um clique.",
    cor: "var(--amber)",
  },
];

const FEATURES = [
  { icon: "🔥", tag: "SCORE", titulo: "Leads quentes no topo", desc: "Quente (70+), morno (40–69), frio (<40). O lead perfeito é o que ainda não tem site — o sistema garante isso." },
  { icon: "🌍", tag: "MUNDIAL", titulo: "Planeta inteiro", desc: "Lisboa, Miami, Tóquio, São Paulo. Qualquer cidade, qualquer país — base viva do OpenStreetMap." },
  { icon: "🧠", tag: "IA", titulo: "Fala a língua do cliente", desc: "Português, inglês, espanhol, francês, alemão, italiano. A mensagem sai nativa, não traduzida." },
  { icon: "📡", tag: "OSINT", titulo: "Radar invisível", desc: "7 motores de busca simultâneos varrem a internet para achar Instagram, e-mail e telefone de cada empresa." },
  { icon: "🍕", tag: "FOODS", titulo: "Inteligência gastronômica", desc: "Varre iFood, UberEats, Glovo, TripAdvisor e Rappi para caçar restaurantes que precisam de presença digital." },
  { icon: "⚡", tag: "SPEED", titulo: "Enriquecimento paralelo", desc: "Enrichment em lote com 10 threads simultâneas. 50 leads enriquecidos em menos de 2 minutos." },
];

const STATS = [
  { valor: "195", label: "países cobertos", sufixo: "" },
  { valor: "45", label: "categorias de busca", sufixo: "+" },
  { valor: "7", label: "idiomas nativos", sufixo: "" },
  { valor: "10", label: "motores OSINT", sufixo: "×" },
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
      <span className="blip purple" style={{ left: "55%", top: "44%", animationDelay: "4.1s" }} />
      <span className="blip amber" style={{ left: "20%", top: "55%", animationDelay: "0.9s" }} />
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-void relative min-h-screen overflow-hidden">
      {/* Background grid + aurora */}
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora" />
      </div>

      {/* Scan line decorativa */}
      <div className="scan-line" style={{ zIndex: 5 }} />

      {/* ============================================================
          NAV
      ============================================================ */}
      <nav className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <Radar className="h-10 w-10" />
          <span className="headline text-sm font-bold uppercase tracking-widest">
            Prospectando<span className="text-signal-glow">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a href="#como" className="mono hidden text-[11px] uppercase tracking-widest text-[var(--ink-faint)] transition hover:text-[var(--signal)] sm:block px-3 py-1.5">
            Como funciona
          </a>
          <a href="#recursos" className="mono hidden text-[11px] uppercase tracking-widest text-[var(--ink-faint)] transition hover:text-[var(--signal)] sm:block px-3 py-1.5">
            Recursos
          </a>
          <Link href="/login" className="btn-signal mono rounded-xl px-5 py-2.5 text-[11px] uppercase tracking-widest">
            Acessar painel →
          </Link>
        </div>
      </nav>

      {/* ============================================================
          HERO
      ============================================================ */}
      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-12 lg:grid-cols-[1.2fr_0.8fr] lg:pt-16">
        <div>
          {/* Eyebrow */}
          <p className="eyebrow reveal d1">
            <span className="pulse-dot" />
            Radar global de oportunidades · sistema ativo
          </p>

          {/* Título principal */}
          <h1 className="headline reveal d2 mt-7 text-5xl font-extrabold leading-[1.02] sm:text-7xl">
            Empresas no{" "}
            <span className="grad-text">mundo inteiro</span>
            <br />
            <span className="outline-text">sem site.</span>
          </h1>

          <p className="reveal d3 mt-6 max-w-lg text-[1.05rem] leading-relaxed text-[var(--ink-dim)]">
            O ProspectandoAI varre o mapa mundial, encontra negócios reais por cidade,
            qualifica quais <strong className="text-[var(--ink)]">não têm presença digital</strong> e
            escreve a abordagem perfeita com IA — no idioma de cada país.
          </p>

          {/* CTAs */}
          <div className="reveal d4 mt-9 flex flex-wrap items-center gap-4">
            <Link href="/login" className="btn-signal rounded-2xl px-8 py-4 text-sm uppercase tracking-widest shadow-2xl">
              🎯 Começar agora — grátis
            </Link>
            <a href="#como" className="btn-ghost mono rounded-2xl px-8 py-4 text-xs uppercase tracking-widest">
              Ver como funciona
            </a>
          </div>

          {/* Stats */}
          <div className="reveal d5 mt-14 grid max-w-md grid-cols-4 gap-0">
            {STATS.map((s, i) => (
              <div key={s.label} className={`text-center ${i < 3 ? "border-r border-[var(--line)]" : ""}`}>
                <p className="stat-num text-3xl">{s.valor}{s.sufixo}</p>
                <p className="mono mt-1 text-[9px] uppercase tracking-widest text-[var(--ink-faint)] leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Radar 3D Hero */}
        <div className="reveal d3 relative mx-auto hidden aspect-square w-full max-w-[400px] lg:block">
          <div className="float-slow radar-3d aspect-square w-full">
            <Radar className="aspect-square w-full" />
          </div>
          {/* Labels flutuantes */}
          <div className="mono absolute -left-5 top-6 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[9px] uppercase tracking-widest text-[var(--ink-dim)] backdrop-blur">
            <span className="text-[var(--signal)]">▶</span> varrendo · são paulo · 23.55°S
          </div>
          <div className="mono absolute -right-4 bottom-12 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[9px] uppercase tracking-widest text-[var(--ink-dim)] backdrop-blur">
            <span className="text-[var(--amber)]">⊙</span> 134 alvos · 41 sem site
          </div>
          <div className="mono absolute -bottom-4 left-8 rounded-lg border border-[rgba(45,255,180,0.25)] bg-[rgba(45,255,180,0.07)] px-3 py-2 text-[9px] uppercase tracking-widest text-[var(--signal)] backdrop-blur">
            🔥 alvo travado · score 87
          </div>
        </div>
      </section>

      {/* ============================================================
          TICKER
      ============================================================ */}
      <div className="relative z-10 overflow-hidden border-y border-[var(--line)] bg-[rgba(6,11,18,0.7)] py-4 backdrop-blur">
        <div className="ticker-track">
          {[...TICKER, ...TICKER].map((c, i) => (
            <span key={i} className="mono flex items-center gap-2 text-[11px] tracking-widest text-[var(--ink-faint)]">
              <span className="text-sm">{c.icon}</span>
              {c.label}
              <span className="text-[var(--line-strong)]">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============================================================
          COMO FUNCIONA
      ============================================================ */}
      <section id="como" className="relative z-10 mx-auto max-w-6xl px-6 py-28">
        <p className="eyebrow reveal">Protocolo de caça</p>
        <h2 className="headline reveal d1 mt-5 text-4xl font-bold sm:text-6xl">
          Três movimentos.<br />
          <span className="outline-text">Zero achismo.</span>
        </h2>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {PASSOS.map((p, i) => (
            <div key={p.n} className={`panel holo panel-hover hover-glow reveal d${i + 2} relative overflow-hidden rounded-3xl p-8`}>
              {/* Número decorativo */}
              <span
                className="impact pointer-events-none absolute -right-2 -top-4 text-[110px] leading-none select-none"
                style={{ color: "transparent", WebkitTextStroke: `1px ${p.cor}22` }}
              >
                {p.n}
              </span>
              {/* Ícone */}
              <div
                className="mono mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                style={{ background: `${p.cor}18`, border: `1px solid ${p.cor}30`, color: p.cor }}
              >
                {p.icon}
              </div>
              <h3 className="headline text-xl font-bold" style={{ color: p.cor }}>{p.titulo}</h3>
              <p className="mt-4 text-sm leading-relaxed text-[var(--ink-dim)]">{p.desc}</p>
              {/* Bottom glow line */}
              <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${p.cor}44, transparent)` }} />
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SCORE VISUAL
      ============================================================ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
        <div className="panel holo reveal overflow-hidden rounded-3xl">
          <div className="grid lg:grid-cols-2">
            {/* Texto */}
            <div className="p-10 lg:p-14">
              <p className="eyebrow">O algoritmo do lead perfeito</p>
              <h2 className="headline mt-5 text-3xl font-bold sm:text-4xl">
                Cada empresa vira um<br />
                <span className="grad-text">score de 0 a 100.</span>
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-[var(--ink-dim)]">
                O critério é brutalmente honesto: para quem vende site, o melhor lead é o que{" "}
                <strong className="text-[var(--ink)]">ainda não tem um</strong>. O ranking faz o trabalho sujo — você só ataca o topo.
              </p>
              <div className="mono mt-8 flex flex-wrap gap-3 text-[10px] uppercase tracking-widest">
                <span className="badge border-[var(--alert)]/50 bg-[var(--alert)]/10 text-[var(--alert)]">🔥 Quente · 70+</span>
                <span className="badge border-[var(--amber)]/50 bg-[var(--amber)]/10 text-[var(--amber)]">◐ Morno · 40–69</span>
                <span className="badge border-[var(--line-strong)] bg-white/5 text-[var(--ink-dim)]">○ Frio · &lt;40</span>
              </div>
            </div>

            {/* Barras */}
            <div className="border-t border-[var(--line)] p-10 lg:border-l lg:border-t-0 lg:p-14">
              {[
                { label: "Sem website",      peso: "+40 pts", w: "100%", cor: "var(--signal)" },
                { label: "Instagram ativo",  peso: "+20 pts", w: "50%",  cor: "#8b5cf6" },
                { label: "E-mail público",   peso: "+20 pts", w: "50%",  cor: "#38bdf8" },
                { label: "Telefone",         peso: "+10 pts", w: "25%",  cor: "var(--amber)" },
                { label: "Endereço completo",peso: "+10 pts", w: "25%",  cor: "var(--ink-dim)" },
              ].map((r) => (
                <div key={r.label} className="mb-5 last:mb-0">
                  <div className="mono mb-2 flex justify-between text-[10px] uppercase tracking-widest">
                    <span className="text-[var(--ink-dim)]">{r.label}</span>
                    <span className="font-semibold" style={{ color: r.cor }}>{r.peso}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: r.w, background: r.cor, boxShadow: `0 0 10px ${r.cor}`, transition: "width 1s ease" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          RECURSOS
      ============================================================ */}
      <section id="recursos" className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
        <p className="eyebrow reveal">Arsenal completo</p>
        <h2 className="headline reveal d1 mt-5 text-4xl font-bold sm:text-6xl">
          Tudo que a caça exige.
        </h2>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.titulo} className={`panel holo panel-hover hover-glow reveal d${(i % 3) + 2} relative overflow-hidden rounded-2xl p-7`}>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">{f.icon}</span>
                <span className="mono text-[9px] uppercase tracking-[0.3em] text-[var(--signal)]">[{f.tag}]</span>
              </div>
              <h3 className="headline text-base font-bold">{f.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-dim)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          CTA FINAL
      ============================================================ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <div className="reveal relative overflow-hidden rounded-3xl border border-[var(--line-strong)] p-14 text-center lg:p-24">
          {/* Aurora de fundo */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
            <div className="aurora" />
          </div>
          {/* Radar decorativo */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Radar className="aspect-square w-[600px] max-w-none opacity-10" />
          </div>

          <div className="relative">
            <p className="eyebrow justify-center">Sinal detectado</p>
            <h2 className="headline mx-auto mt-6 max-w-2xl text-4xl font-extrabold sm:text-6xl">
              Seu próximo cliente<br />
              já está no mapa.{" "}
              <span className="text-signal-glow">Falta só você.</span>
            </h2>
            <Link href="/login" className="btn-signal mt-12 inline-block rounded-2xl px-10 py-5 text-sm uppercase tracking-widest">
              🚀 Abrir o radar — grátis
            </Link>
            <p className="mono mt-6 text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
              sem cartão de crédito · dados abertos do openstreetmap · seguro e privado
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer className="relative z-10 border-t border-[var(--line)] py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Radar className="h-7 w-7" />
              <span className="headline text-xs font-bold uppercase tracking-widest">
                Prospectando<span className="text-signal-glow">AI</span>
              </span>
            </div>
            <div className="mono flex flex-wrap gap-6 text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
              <a href="#como" className="glow-hover">Como funciona</a>
              <a href="#recursos" className="glow-hover">Recursos</a>
              <Link href="/login" className="glow-hover text-[var(--signal)]">Acessar painel</Link>
            </div>
          </div>
          <div className="divider-orb mt-8" />
          <div className="mono mt-8 flex flex-wrap items-center justify-between gap-3 text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
            <span>ProspectandoAI © 2026 — Todos os direitos reservados</span>
            <span>Dados · OpenStreetMap Contributors · ODbL 1.0</span>
            <span className="flex items-center gap-2"><span className="pulse-dot" /> sistema operacional</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
