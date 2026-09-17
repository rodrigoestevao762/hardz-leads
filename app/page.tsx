"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import RealisticGlobe from "@/components/RealisticGlobe";

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
      
      {/* Background Parallax Image - Satellite Slider */}
      <motion.div 
        ref={bgRef}
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ y: yBg }}
      >
        <SatelliteBackground />
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

      {/* ======================= GLOBAL TRACKING WIDGET (GLOBE) ======================= */}
      <section className="relative z-10 border-y border-[var(--signal)]/20 bg-black/80 backdrop-blur-3xl overflow-hidden py-16 md:py-32">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(45,255,180,0.15)_0%,transparent_60%)]" />
        
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Globe Container */}
          <div className="cyber-reveal relative w-full h-[500px] md:h-[600px] rounded-3xl border border-white/10 bg-black/40 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md">
            <RealisticGlobe />
            
            {/* Holographic Overlays */}
            <div className="absolute top-6 left-6 pointer-events-none z-40">
              <div className="mono text-[var(--signal)] text-[10px] tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--signal)] animate-pulse" />
                GLOBAL UPLINK ACTIVE
              </div>
              <div className="mono text-white/40 text-[9px] mt-1">SCANNING NEURAL NETWORKS...</div>
            </div>
            
            <div className="absolute bottom-6 right-6 pointer-events-none text-right z-40">
              <div className="mono text-white/80 text-xl font-bold tracking-widest">14,293</div>
              <div className="mono text-[var(--ink-dim)] text-[9px]">ALVOS DETECTADOS (24H)</div>
            </div>
          </div>

          {/* Globe Content */}
          <div className="cyber-reveal">
            <div className="mono text-[var(--signal)] text-xs tracking-[0.4em] mb-4">MÓDULO DE RADAR ESPACIAL</div>
            <h2 className="headline text-4xl md:text-5xl font-black uppercase leading-tight mb-6">
              Varredura de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--signal)] to-cyan-500">Nível Global</span>
            </h2>
            <p className="text-[var(--ink-dim)] mb-8 leading-relaxed">
              O sistema não se limita a fronteiras. Interaja com o globo holográfico para visualizar concentrações de alvos B2B espalhados pelos principais polos tecnológicos e comerciais do mundo. Onde houver uma empresa desconectada, nós a encontraremos.
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="p-4 border border-white/5 rounded-xl bg-white/[0.02] flex items-center gap-4 hover:border-[var(--signal)]/30 transition-colors">
                <div className="w-12 h-12 rounded-full border border-[var(--signal)]/50 flex items-center justify-center text-[var(--signal)] shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </div>
                <div>
                  <h4 className="text-white font-bold tracking-wide text-sm">Rastreamento Multilíngue</h4>
                  <p className="text-[var(--ink-faint)] text-xs mt-1">IA capaz de traduzir e prospectar em 12+ idiomas instantaneamente.</p>
                </div>
              </div>

              <div className="p-4 border border-white/5 rounded-xl bg-white/[0.02] flex items-center gap-4 hover:border-[#8b5cf6]/30 transition-colors">
                <div className="w-12 h-12 rounded-full border border-[#8b5cf6]/50 flex items-center justify-center text-[#8b5cf6] shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h4 className="text-white font-bold tracking-wide text-sm">Ultra Baixa Latência</h4>
                  <p className="text-[var(--ink-faint)] text-xs mt-1">Conexões assíncronas escaneiam milhares de empresas por segundo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= ARQUITETURA DE DADOS (NOVA PARTE DE BAIXO) ======================= */}
      <section id="matrix" className="relative z-10 mx-auto max-w-7xl px-6 py-32">
        <div className="cyber-reveal text-center mb-16">
          <h2 className="headline text-4xl font-black uppercase tracking-tight text-white">
            Protocolos de <span className="text-[var(--signal)]">Infiltração</span>
          </h2>
          <p className="mono mt-4 text-[var(--ink-dim)] tracking-widest text-xs">MECANISMOS DE CONVERSÃO EXTREMA</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PASSOS.map((p, i) => (
            <div key={p.n} className="cyber-reveal group relative p-px rounded-3xl bg-gradient-to-b from-white/10 to-transparent overflow-hidden">
              <div className="absolute inset-0 bg-[var(--signal)] opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-2xl" />
              <div className="relative h-full bg-black/80 backdrop-blur-xl rounded-[23px] p-8 flex flex-col justify-between border border-white/5 group-hover:border-[var(--signal)]/30 transition-colors">
                
                <div>
                  <div className="mono text-5xl font-black text-white/5 mb-6 group-hover:text-white/10 transition-colors">
                    {p.n}
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-wider mb-3 text-white">{p.titulo}</h3>
                  <p className="text-[var(--ink-faint)] text-sm leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="h-0.5 w-12 bg-white/10 group-hover:bg-[var(--signal)] group-hover:w-20 transition-all duration-500" />
                  <span className="mono text-[10px]" style={{ color: p.cor }}>sys.run()</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= CTA FINAL REDESENHADO ======================= */}
      <section className="relative z-10 py-32 border-t border-[var(--signal)]/20 bg-[radial-gradient(ellipse_at_bottom,rgba(45,255,180,0.1)_0%,black_70%)]">
        <div className="mx-auto max-w-4xl px-6 text-center cyber-reveal">
          <div className="w-24 h-24 mx-auto border border-[var(--signal)]/30 rounded-full flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 border border-[var(--signal)] rounded-full animate-ping opacity-20" />
            <svg className="w-8 h-8 text-[var(--signal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          
          <h2 className="headline text-5xl md:text-6xl font-black uppercase text-white mb-6">
            PRONTO PARA O UPLINK?
          </h2>
          <p className="mono text-[var(--ink-dim)] mb-12 max-w-xl mx-auto leading-relaxed">
            A interface de prospecção mais avançada já construída. Abandone as planilhas. Conecte-se ao Nexus.
          </p>
          <Link href="/login" className="btn-3d btn-3d-primary py-5 px-16 text-lg font-black tracking-widest group">
            <span className="mr-3 group-hover:mr-4 transition-all">✦</span>
            INICIAR SEQUÊNCIA
          </Link>
        </div>
      </section>

    </main>
  );
}

const SATELLITE_IMAGES = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551808525-51a94da548ce?q=80&w=2000&auto=format&fit=crop",
];

function SatelliteBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SATELLITE_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.3, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${SATELLITE_IMAGES[index]}')` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-[#030603]/30 via-[#030603]/80 to-[#030603] backdrop-blur-[2px]" />
      <div className="bg-grid absolute inset-0 opacity-40 mix-blend-overlay" />
    </div>
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
