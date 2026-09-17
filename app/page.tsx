"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const TICKER = [
  { label: "BARBEARIAS", icon: "✂" }, { label: "RESTAURANTES", icon: "🍽" },
  { label: "ACADEMIAS", icon: "⚡" }, { label: "CLÍNICAS", icon: "💊" },
  { label: "SALÕES", icon: "💅" }, { label: "OFICINAS", icon: "🔧" },
];

const PASSOS = [
  { n: "01", titulo: "UPLINK DE REDE", desc: "Conecte-se ao backbone global. O radar varre nós urbanos em segundos caçando assinaturas corporativas.", cor: "var(--signal)" },
  { n: "02", titulo: "ANÁLISE HEURÍSTICA", desc: "Cada alvo recebe um threat-score. Sem ICE (site) = alvo fácil. Nível vulnerável destacado no grid.", cor: "#8b5cf6" },
  { n: "03", titulo: "INFILTRAÇÃO IA", desc: "Geração de payloads de texto via IA neural. A abordagem entra na caixa de entrada traduzida e letal.", cor: "var(--amber)" },
];

export default function CyberpunkLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  // Framer Motion scroll logic
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const springScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const yBg = useTransform(springScroll, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    // Lenis Smooth Scroll Setup
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    gsap.registerPlugin(ScrollTrigger);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // GSAP Parallax and Reveal
    const ctx = gsap.context(() => {
      // Hero text glitch entry
      gsap.fromTo(heroTextRef.current, 
        { opacity: 0, scale: 0.8, filter: "blur(10px)", y: 50 },
        { opacity: 1, scale: 1, filter: "blur(0px)", y: 0, duration: 1.5, ease: "expo.out", delay: 0.2 }
      );

      // Section reveals
      gsap.utils.toArray(".cyber-reveal").forEach((elem: any) => {
        gsap.fromTo(elem,
          { opacity: 0, y: 100, rotationX: 45 },
          { 
            scrollTrigger: { trigger: elem, start: "top 85%" },
            opacity: 1, y: 0, rotationX: 0,
            duration: 1.2, ease: "power4.out"
          }
        );
      });
    }, containerRef);

    return () => {
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  return (
    <main ref={containerRef} className="bg-void relative min-h-screen overflow-hidden text-white font-sans selection:bg-[var(--signal)] selection:text-black">
      
      {/* Background Parallax Image - Cyberpunk City / Netrunner vibe */}
      <motion.div 
        ref={bgRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ y: yBg }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2000&auto=format&fit=crop')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030603]/80 to-[#030603] backdrop-blur-[2px]" />
        <div className="bg-grid absolute inset-0 opacity-50" />
      </motion.div>

      {/* Cyberpunk Scanline */}
      <div className="scan-line z-50 pointer-events-none opacity-50 mix-blend-screen" />

      {/* ======================= NAV ======================= */}
      <nav className="relative z-40 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 backdrop-blur-md border-b border-white/5">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 group"
        >
          <div className="radar h-10 w-10 border-[var(--signal)] group-hover:scale-110 transition-transform">
            <div className="radar-sweep opacity-80" />
          </div>
          <span className="headline text-sm font-bold uppercase tracking-widest text-white drop-shadow-[0_0_10px_rgba(45,255,180,0.8)]">
            NEXUS<span className="text-[var(--signal)]">.AI</span>
          </span>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/login" className="btn-3d btn-3d-primary shadow-[0_0_20px_rgba(45,255,180,0.4)]">
            INIT UPLINK →
          </Link>
        </motion.div>
      </nav>

      {/* ======================= HERO ======================= */}
      <section className="relative z-10 mx-auto flex min-h-[85vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 1 }}
          className="mono mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--signal)]/30 bg-[var(--signal)]/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[var(--signal)]"
        >
          <span className="pulse-dot" /> Sistema de varredura global online
        </motion.div>

        <h1 ref={heroTextRef} className="headline text-6xl font-black uppercase tracking-tighter sm:text-8xl md:text-[8rem] leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          DOMINE O <br />
          <span className="text-[var(--signal)] drop-shadow-[0_0_40px_rgba(45,255,180,0.6)]">CYBERESPAÇO.</span>
        </h1>

        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-8 max-w-2xl text-lg text-[var(--ink-dim)] mono"
        >
          Extração de dados neurais. Varredura global OSINT. 
          Encontre corporações vulneráveis (sem website) no mundo inteiro e hackeie suas caixas de entrada com inteligência artificial.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          className="mt-12 flex flex-wrap justify-center gap-6"
        >
          <Link href="/login" className="btn-3d btn-3d-primary py-4 px-10 text-sm">
            ▶ ACESSO AO TERMINAL
          </Link>
          <a href="#matrix" className="btn-3d btn-3d-dark py-4 px-10 text-sm border border-white/10">
            VISÃO TÁTICA
          </a>
        </motion.div>
      </section>

      {/* ======================= TICKER ======================= */}
      <div className="relative z-20 border-y border-[var(--signal)]/20 bg-black/60 backdrop-blur-xl py-3 overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex whitespace-nowrap gap-12"
        >
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((c, i) => (
            <span key={i} className="mono text-[12px] uppercase tracking-widest text-[var(--signal)]/80 flex items-center gap-3">
              {c.icon} {c.label} <span className="text-white/20">///</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ======================= PROTOCOLO DE CAÇA ======================= */}
      <section id="matrix" className="relative z-10 mx-auto max-w-7xl px-6 py-32">
        <div className="cyber-reveal text-center mb-20">
          <h2 className="headline text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            ARQUITETURA DE INFILTRAÇÃO
          </h2>
          <p className="mono mt-4 text-[var(--signal)] tracking-[0.3em] text-xs">TRÊS FASES. ZERO DETECÇÃO.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PASSOS.map((p, i) => (
            <div key={p.n} className="cyber-reveal group relative rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-md overflow-hidden hover:border-[var(--signal)]/50 transition-colors duration-500">
              <div className="absolute -inset-1 bg-gradient-to-b from-[var(--signal)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl z-0" />
              
              <div className="relative z-10">
                <div className="text-[5rem] font-black text-white/5 leading-none absolute -top-4 -right-4 pointer-events-none group-hover:text-[var(--signal)]/10 transition-colors">
                  {p.n}
                </div>
                <h3 className="mono text-xl font-bold mb-4 tracking-widest" style={{ color: p.cor }}>{p.titulo}</h3>
                <p className="text-[var(--ink-dim)] leading-relaxed text-sm">
                  {p.desc}
                </p>
              </div>

              {/* Decorative cyber lines */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-[var(--signal)] transition-all duration-700 group-hover:w-full" />
              <div className="absolute top-0 right-0 w-1 h-0 bg-[var(--signal)] transition-all duration-700 group-hover:h-full delay-100" />
            </div>
          ))}
        </div>
      </section>

      {/* ======================= HOLO INTERFACE ======================= */}
      <section className="relative z-10 border-y border-white/10 bg-black/40 backdrop-blur-2xl py-32">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="cyber-reveal">
            <div className="mono text-[var(--signal)] text-xs tracking-[0.4em] mb-4">ALGORITMO HEURÍSTICO</div>
            <h2 className="headline text-5xl font-black uppercase leading-tight mb-6">
              Mapeamento de<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--signal)] to-blue-500">
                Alvos Vulneráveis
              </span>
            </h2>
            <p className="text-[var(--ink-dim)] mb-8 max-w-md leading-relaxed">
              Nosso motor cruza dados em tempo real. Se uma corporação não possui escudo digital (website), ela acende no radar como alvo primordial.
            </p>
            
            <div className="space-y-4">
              {[
                { label: "Sem Website (Alvo Crítico)", bar: "100%", color: "var(--signal)" },
                { label: "Instagram Detectado", bar: "60%", color: "#8b5cf6" },
                { label: "E-mail Exposto", bar: "40%", color: "#38bdf8" },
              ].map(item => (
                <div key={item.label} className="mono text-xs">
                  <div className="flex justify-between mb-2">
                    <span className="text-white/60">{item.label}</span>
                    <span style={{ color: item.color }}>[ {item.bar} ]</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: item.bar }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      viewport={{ once: true }}
                      className="h-full shadow-[0_0_10px_currentColor]"
                      style={{ backgroundColor: item.color, color: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cyber-reveal relative h-[400px] w-full rounded-3xl border border-[var(--signal)]/30 bg-black/50 overflow-hidden flex items-center justify-center perspective-[1000px]">
             {/* 3D Floating Cyber Element */}
             <motion.div 
               animate={{ rotateX: [0, 10, -10, 0], rotateY: [0, 15, -15, 0] }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="relative w-64 h-64 border-2 border-[var(--signal)]/40 rounded-full flex items-center justify-center transform-style-3d shadow-[0_0_50px_rgba(45,255,180,0.2)]"
             >
                <div className="absolute w-48 h-48 border border-[#8b5cf6]/50 rounded-full animate-[spin_4s_linear_reverse_infinite]" />
                <div className="absolute w-32 h-32 border-2 border-[#38bdf8]/60 rounded-full animate-[spin_3s_linear_infinite]" />
                <Radar className="w-20 h-20 text-[var(--signal)]" />
             </motion.div>
             <div className="absolute top-4 left-4 mono text-[10px] text-[var(--signal)]">SYS.CORE.ACTIVE</div>
             <div className="absolute bottom-4 right-4 mono text-[10px] text-white/40">COORD: 45.992, -12.441</div>
          </div>
        </div>
      </section>

      {/* ======================= CTA FINAL ======================= */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-40 text-center cyber-reveal">
        <h2 className="headline text-6xl font-black uppercase text-white mb-8 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          PRONTO PARA O UPLINK?
        </h2>
        <p className="mono text-[var(--ink-dim)] mb-12">
          Abandone as ferramentas antigas. Conecte-se ao nexus e automatize sua prospecção em escala global.
        </p>
        <Link href="/login" className="btn-3d btn-3d-primary py-5 px-16 text-lg font-black tracking-widest shadow-[0_0_40px_rgba(45,255,180,0.5)]">
          INICIAR SEQUÊNCIA
        </Link>
      </section>

    </main>
  );
}

// Micro-component Radar so we don't depend on external if missing
function Radar({ className }: { className?: string }) {
  return (
    <div className={`radar ${className || ""}`}>
      <div className="radar-sweep" />
      <div className="crosshair-v" style={{ left: "50%", top: "6%", bottom: "6%", width: 1 }} />
      <div className="crosshair-h" style={{ top: "50%", left: "6%", right: "6%", height: 1 }} />
      <span className="blip" style={{ left: "28%", top: "34%", animationDelay: "0.6s" }} />
      <span className="blip" style={{ left: "62%", top: "22%", animationDelay: "2.1s" }} />
      <span className="blip amber" style={{ left: "70%", top: "58%", animationDelay: "1.2s" }} />
    </div>
  );
}
