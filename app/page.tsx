"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import RealisticGlobe from "@/components/RealisticGlobe";

const FEATURES = [
  { n: "01", titulo: "MAPEAMENTO GLOBAL OSINT", desc: "O radar varre o globo em tempo real. Nossa engine OSINT identifica milhares de empresas desprotegidas por segundo, varrendo as coordenadas de todos os pólos comerciais do planeta.", cor: "#38bdf8", colSpan: "md:col-span-2", icon: "🌍" },
  { n: "02", titulo: "MOTOR DE IA POLIGLOTA", desc: "Cada alvo recebe uma abordagem neural nativa. A IA traduz perfeitamente e redige cold e-mails de conversão extrema em mais de 15 idiomas simultaneamente.", cor: "#8b5cf6", colSpan: "md:col-span-1", icon: "🧠" },
  { n: "03", titulo: "BYPASS DE SPAM FANTASMA", desc: "Infraestrutura de envios corporativa. Rotacionamos domínios e IPs para garantir 99.8% de taxa de entrega na caixa principal. O alvo nem saberá de onde veio a interceptação.", cor: "#ec4899", colSpan: "md:col-span-1", icon: "👻" },
  { n: "04", titulo: "QUALIFICAÇÃO HEURÍSTICA", desc: "O algoritmo não apenas encontra empresas, ele pontua os alvos baseando-se em ausência de site e presença digital, entregando um 'Threat-Score' instantâneo para priorização.", cor: "#10b981", colSpan: "md:col-span-2", icon: "🎯" },
  { n: "05", titulo: "BLINDAGEM DE DOMÍNIO", desc: "Aquecimento contínuo automatizado. A IA simula diálogos humanos nas suas caixas de saída 24/7 para construir sua reputação como emissor autoritário.", cor: "#f59e0b", colSpan: "md:col-span-2", icon: "🛡️" },
  { n: "06", titulo: "VISÃO TÁTICA (CRM)", desc: "Seu dashboard de comando. Acompanhe a abertura dos payloads, intercepte respostas quentes e gerencie o faturamento através de um HUD de alto contraste.", cor: "#38bdf8", colSpan: "md:col-span-1", icon: "💻" },
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
    <main ref={containerRef} className="bg-void relative min-h-screen overflow-hidden text-white font-sans selection:bg-[#38bdf8] selection:text-black">
      
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

      {/* ======================= NAV "OUT OF THIS WORLD" ======================= */}
      <nav className="fixed top-6 inset-x-0 z-50 mx-auto w-[95%] max-w-7xl rounded-2xl border border-[#38bdf8]/20 bg-black/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group transition-all hover:border-[#38bdf8]/50 hover:shadow-[0_0_40px_rgba(56,189,248,0.2)]">
        {/* Animated laser scan line inside nav */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
           <div className="absolute top-0 left-[-100%] w-[200%] h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent animate-[scan_3s_linear_infinite]" />
        </div>
        <div className="relative flex items-center justify-between px-6 py-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 cursor-pointer"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#38bdf8] to-[#0284c7] flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.4)] overflow-hidden">
              <div className="absolute inset-0 bg-white/20 blur-md transform scale-150 group-hover:rotate-180 transition-transform duration-1000" />
              <svg className="w-5 h-5 text-[#0a121b] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-black tracking-widest text-white leading-none">
                HARDZ<span className="text-[#38bdf8]">.AI</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#38bdf8]/60 mt-1">Uplink Estabelecido</span>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] mono text-[#10b981] uppercase tracking-widest">Sistemas Operacionais</span>
            </div>
            <Link href="/login" className="btn-3d px-6 py-3 rounded-xl border border-[#38bdf8]/30 bg-[#38bdf8]/10 text-xs font-bold tracking-widest uppercase text-[#38bdf8] hover:bg-[#38bdf8] hover:text-black transition-all shadow-[0_0_20px_rgba(56,189,248,0.1)]">
              [ INIT UPLINK ]
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ======================= HERO ======================= */}
      <section className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center pt-20">
        
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#38bdf8] opacity-15 blur-[120px] pointer-events-none rounded-full" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-4 py-1.5 text-xs font-medium tracking-widest text-[#38bdf8]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse shadow-[0_0_8px_#38bdf8]" />
          SISTEMA DE VARREDURA GLOBAL ONLINE
        </motion.div>

        <h1 ref={heroTextRef} className="font-display text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-white leading-[1.1] mb-6 flex flex-col items-center">
          <span>DOMINE O</span>
          <div className="flex text-transparent bg-clip-text bg-gradient-to-b from-[#38bdf8] to-[#0284c7] drop-shadow-[0_0_20px_rgba(56,189,248,0.3)] mt-2">
            {"CYBERESPAÇO.".split("").map((char, index) => (
              <motion.span
                key={index}
                whileHover={{ 
                  y: -10, 
                  color: "#fff",
                  textShadow: "0px 10px 20px rgba(56,189,248,0.8)",
                  transition: { duration: 0.2 } 
                }}
                className="inline-block cursor-crosshair transition-colors duration-300"
              >
                {char}
              </motion.span>
            ))}
          </div>
        </h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="max-w-2xl text-base md:text-lg text-[var(--ink-dim)] font-body leading-relaxed mb-10"
        >
          Extração de dados neurais. Varredura global OSINT. 
          Encontre corporações vulneráveis (sem website) no mundo inteiro e hackeie suas caixas de entrada com inteligência artificial.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
        >
          <Link href="/login" className="btn-3d px-10 py-5 text-[11px] rounded-xl text-[#082f49] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_0_#0284c7,0_8px_30px_rgba(56,189,248,0.4)]" style={{ background: "linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)" }}>
            <span className="mr-2">▶</span> ACESSO AO TERMINAL
          </Link>
          <a href="#matrix" className="btn-3d btn-3d-dark px-10 py-5 text-[11px] rounded-xl border border-white/10 hover:border-[#38bdf8]/50">
            VISÃO TÁTICA
          </a>
        </motion.div>
      </section>

      {/* ======================= GLOBAL TRACKING WIDGET (GLOBE) ======================= */}
      <section className="relative z-10 border-y border-[#38bdf8]/20 bg-black/80 backdrop-blur-3xl overflow-hidden py-16 md:py-32">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.15)_0%,transparent_60%)]" />
        
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Globe Container */}
          <div className="cyber-reveal relative w-full h-[500px] md:h-[600px] rounded-3xl border border-white/10 bg-black/40 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md">
            <RealisticGlobe />
            
            {/* Holographic Overlays */}
            <div className="absolute top-6 left-6 pointer-events-none z-40">
              <div className="mono text-[#38bdf8] text-[10px] tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
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
            <div className="mono text-[#38bdf8] text-xs tracking-[0.4em] mb-4">MÓDULO DE RADAR ESPACIAL</div>
            <h2 className="headline text-4xl md:text-5xl font-black uppercase leading-tight mb-6">
              Varredura de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-cyan-500">Nível Global</span>
            </h2>
            <p className="text-[var(--ink-dim)] mb-8 leading-relaxed">
              O sistema não se limita a fronteiras. Interaja com o globo holográfico para visualizar concentrações de alvos B2B espalhados pelos principais polos tecnológicos e comerciais do mundo. Onde houver uma empresa desconectada, nós a encontraremos.
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="p-4 border border-white/5 rounded-xl bg-white/[0.02] flex items-center gap-4 hover:border-[#38bdf8]/30 transition-colors">
                <div className="w-12 h-12 rounded-full border border-[#38bdf8]/50 flex items-center justify-center text-[#38bdf8] shrink-0">
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
            Protocolos de <span className="text-[#38bdf8]">Infiltração</span>
          </h2>
          <p className="mono mt-4 text-[var(--ink-dim)] tracking-widest text-xs">MECANISMOS DE CONVERSÃO EXTREMA</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 auto-rows-[auto]">
          {FEATURES.map((p, i) => (
            <div key={p.n} className={`cyber-reveal group relative p-px rounded-3xl bg-gradient-to-b from-white/10 to-transparent overflow-hidden ${p.colSpan}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-[80px] opacity-0 group-hover:opacity-30 transition-all duration-700" style={{ backgroundColor: p.cor }} />
              
              <div className="relative h-full bg-[#0a121b]/80 backdrop-blur-xl rounded-[23px] p-8 lg:p-10 flex flex-col justify-between border border-white/5 group-hover:border-white/20 transition-all duration-500 group-hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-4xl filter drop-shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">{p.icon}</div>
                    <div className="mono text-5xl font-black text-white/5 group-hover:text-white/20 transition-colors">
                      {p.n}
                    </div>
                  </div>
                  
                  <h3 className="font-display text-xl lg:text-2xl font-bold uppercase tracking-wide mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
                    {p.titulo}
                  </h3>
                  <p className="text-[var(--ink-dim)] text-sm lg:text-base leading-relaxed group-hover:text-white/80 transition-colors duration-500">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
                  <div className="flex gap-1.5">
                    <div className="h-1.5 w-2 rounded-full opacity-20 group-hover:opacity-100 transition-all delay-75" style={{ backgroundColor: p.cor }} />
                    <div className="h-1.5 w-4 rounded-full opacity-20 group-hover:opacity-100 transition-all delay-100" style={{ backgroundColor: p.cor }} />
                    <div className="h-1.5 w-8 rounded-full opacity-20 group-hover:opacity-100 transition-all delay-150" style={{ backgroundColor: p.cor }} />
                  </div>
                  <span className="mono text-[10px] tracking-widest uppercase opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: p.cor }}>sys.run()</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= CTA FINAL REDESENHADO ======================= */}
      <section className="relative z-10 py-32 border-t border-[#38bdf8]/20 bg-[radial-gradient(ellipse_at_bottom,rgba(56,189,248,0.1)_0%,black_70%)]">
        <div className="mx-auto max-w-4xl px-6 text-center cyber-reveal">
          <div className="w-24 h-24 mx-auto border border-[#38bdf8]/30 rounded-full flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 border border-[#38bdf8] rounded-full animate-ping opacity-20" />
            <svg className="w-8 h-8 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
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
          animate={{ opacity: 0.6, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${SATELLITE_IMAGES[index]}')` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-[#030603]/10 via-[#030603]/40 to-[#030603]/90" />
      <div className="bg-grid absolute inset-0 opacity-20 mix-blend-overlay" />
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
