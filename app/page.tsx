"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, Crosshair, Radar as RadarIcon, Globe2, BrainCircuit, ScanSearch, Zap, Database, ChevronRight } from "lucide-react";

const TICKER = [
  { label: "BARBEARIAS", icon: "✂" }, { label: "RESTAURANTES", icon: "🍽" },
  { label: "ACADEMIAS", icon: "⚡" }, { label: "CLÍNICAS", icon: "💊" },
  { label: "SALÕES", icon: "💅" }, { label: "OFICINAS", icon: "🔧" },
  { label: "PET SHOPS", icon: "🐾" }, { label: "HOTÉIS", icon: "🏨" },
];

const PASSOS = [
  { n: "01", titulo: "INITIALIZE SCAN", desc: "Varredura global ativada. Especifique os parâmetros da cidade e nicho alvo. O sistema mapeará todas as entidades correspondentes." },
  { n: "02", titulo: "DATA ENRICHMENT", desc: "Interceptação de dados em andamento. Extração cruzada OSINT (Instagram, Email, Contato). Entidades sem presença web detectadas." },
  { n: "03", titulo: "EXECUTE DEPLOY", desc: "Payload de mensagem gerado via IA. Disparo imediato via SMTP ou injeção direta no canal social (DM)." },
];

const FEATURES = [
  { icon: <Crosshair size={20} />, tag: "TARGETING", titulo: "Triagem de Vulnerabilidade", desc: "Identifica com precisão alvos com falhas na presença digital (Sem Website)." },
  { icon: <Globe2 size={20} />, tag: "GLOBAL_SCOPE", titulo: "Operação Sem Fronteiras", desc: "Base de dados extraída diretamente dos nós da infraestrutura OpenStreetMap." },
  { icon: <BrainCircuit size={20} />, tag: "NEURAL_NET", titulo: "IA Poliglota", desc: "Sintetização de abordagem nativa em múltiplos idiomas. Bypass de detectores." },
  { icon: <ScanSearch size={20} />, tag: "OSINT_RADAR", titulo: "Extração Fantasma", desc: "Rede de proxies distribuídos para extração profunda sem bloqueios." },
];

const STATS = [
  { valor: "195", label: "NODOS (PAÍSES)" },
  { valor: "45", label: "VETORES (NICHOS)" },
  { valor: "10", label: "THREADS OSINT" },
];

function RadarVisual({ className }: { className?: string }) {
  return (
    <div className={`radar ${className || ""}`}>
      <div className="radar-sweep" />
      <div className="crosshair-v" style={{ left: "50%", top: "6%", bottom: "6%", width: 1 }} />
      <div className="crosshair-h" style={{ top: "50%", left: "6%", right: "6%", height: 1 }} />
      <motion.span animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="absolute h-2 w-2 rounded-full bg-[var(--signal)] shadow-[0_0_10px_var(--signal)]" style={{ left: "28%", top: "34%" }} />
      <motion.span animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} className="absolute h-2 w-2 rounded-full bg-[var(--cyan)] shadow-[0_0_10px_var(--cyan)]" style={{ left: "62%", top: "22%" }} />
      <motion.span animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0 }} className="absolute h-2 w-2 rounded-full bg-[var(--amber)] shadow-[0_0_10px_var(--amber)]" style={{ left: "70%", top: "58%" }} />
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-void relative min-h-screen overflow-hidden selection:bg-[var(--signal)] selection:text-black">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay filter grayscale" />
      </div>
      <div className="scan-line" />

      {/* NAV */}
      <nav className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <Terminal className="text-[var(--signal)]" size={24} />
          <span className="headline text-sm font-bold tracking-[0.2em] text-white">
            PROSPECTANDO<span className="text-[var(--signal)]">AI</span>_
          </span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <Link href="/login" className="btn-ghost flex items-center gap-2 px-4 py-2 text-xs">
            [ LOGIN_ROOT ] <ChevronRight size={14} />
          </Link>
        </motion.div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ staggerChildren: 0.1 }}>
          <div className="mono mb-6 inline-flex items-center gap-2 border border-[var(--signal)] bg-[var(--signal)]/10 px-3 py-1 text-[10px] text-[var(--signal)]">
            <span className="h-1.5 w-1.5 animate-pulse bg-[var(--signal)]" />
            SYSTEM.STATUS: ONLINE
          </div>

          <h1 className="headline text-5xl font-bold leading-[1.1] text-white sm:text-7xl">
            EXTRACT.<br />
            <span className="text-[var(--signal)] glitch-hover">DOMINATE.</span><br />
            REPEAT.
          </h1>

          <p className="mono mt-6 max-w-lg text-sm leading-relaxed text-[var(--ink-dim)]">
            {">"} Iniciando varredura OSINT global... Encontrando empresas vulneráveis (sem website) na matrix. Automação de prospecção iniciada.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <Link href="/login" className="btn-signal flex items-center gap-2 px-8 py-4 text-sm shadow-[0_0_15px_var(--signal)]">
              <Database size={16} /> INICIAR EXTRAÇÃO
            </Link>
          </div>

          <div className="mt-14 grid max-w-md grid-cols-3 gap-0 border-y border-[var(--line)] py-6">
            {STATS.map((s, i) => (
              <div key={s.label} className={`text-center ${i < 2 ? "border-r border-[var(--line)]" : ""}`}>
                <p className="impact text-3xl text-white">{s.valor}</p>
                <p className="mono mt-1 text-[9px] tracking-widest text-[var(--ink-dim)]">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero Radar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1 }}
          className="relative mx-auto hidden aspect-square w-full max-w-[400px] lg:block"
        >
          <RadarVisual className="h-full w-full opacity-80" />
          
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 4 }}
            className="panel absolute -left-4 top-10 p-3"
          >
            <p className="mono text-[10px] text-[var(--signal)]">&gt; TARGET_LOCK: ACTIVE</p>
            <p className="mono text-[9px] text-[var(--ink-dim)]">LAT: 23.55°S / LON: 46.63°W</p>
          </motion.div>
        </motion.div>
      </section>

      {/* WORKFLOW */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 border-b border-[var(--line)] pb-4">
          <h2 className="headline text-2xl text-white">/ EXECUTION_FLOW</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {PASSOS.map((p, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={p.n} 
              className="panel panel-hover relative p-8"
            >
              <div className="impact text-5xl text-[var(--line-strong)] absolute top-4 right-4">{p.n}</div>
              <h3 className="headline mb-4 mt-8 text-lg text-[var(--signal)]">{p.titulo}</h3>
              <p className="mono text-xs leading-relaxed text-[var(--ink-dim)]">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <div className="mb-12 border-b border-[var(--line)] pb-4">
          <h2 className="headline text-2xl text-white">/ SYSTEM_MODULES</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              key={f.tag} 
              className="panel flex items-start gap-5 p-6 group hover:border-[var(--signal)] transition-colors"
            >
              <div className="text-[var(--line-strong)] group-hover:text-[var(--signal)] transition-colors">
                {f.icon}
              </div>
              <div>
                <p className="mono mb-1 text-[10px] text-[var(--signal)]">[{f.tag}]</p>
                <h3 className="headline text-sm text-white mb-2">{f.titulo}</h3>
                <p className="mono text-[11px] text-[var(--ink-dim)]">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </main>
  );
}
