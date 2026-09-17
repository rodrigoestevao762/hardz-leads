"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { CATEGORIAS } from "@/lib/categorias";

type Empresa = {
  osmId: string; nome: string; categoria: string; cidade: string; pais: string;
  telefone: string | null; website: string | null; instagram: string | null; email: string | null;
  endereco: string; score: number; nivel: "quente" | "morno" | "frio";
};

const NIVEL_ESTILO: Record<Empresa["nivel"], string> = {
  quente: "border-[var(--alert)]/50 bg-[var(--alert)]/10 text-[var(--alert)]",
  morno: "border-[var(--amber)]/50 bg-[var(--amber)]/10 text-[var(--amber)]",
  frio: "border-[var(--line-strong)] bg-white/5 text-[var(--ink-dim)]",
};

const NIVEL_ACCENT: Record<Empresa["nivel"], string> = {
  quente: "#ff5d5d",
  morno: "#ffb02d",
  frio: "#55685f",
};

export default function BuscaPage() {
  const [categoria, setCategoria] = useState("barbearia");
  const [cidade, setCidade] = useState("");
  const [pais, setPais] = useState("");
  const [resultados, setResultados] = useState<Empresa[] | null>(null);
  const [salvos, setSalvos] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [checando, setChecando] = useState<string | null>(null);
  const [somenteInstagram, setSomenteInstagram] = useState(false);

  async function checarRedes(emp: Empresa) {
    setChecando(emp.osmId);
    const res = await fetch("/api/enrich-search", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: emp.nome, cidade: emp.cidade, pais: emp.pais }),
    });
    const json = await res.json();
    setChecando(null);
    if (res.ok && json.data) {
      setResultados(resul => resul?.map(r => r.osmId === emp.osmId ? { ...r, ...json.data } : r) || null);
    }
  }

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true); setErro(null); setResultados(null); setSalvos(new Set());
    const res = await fetch("/api/buscar", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoria, cidade, pais }),
    });
    const json = await res.json();
    setCarregando(false);
    if (!res.ok) return setErro(json.erro || "Erro na busca");
    setResultados(json.empresas);
  }

  async function salvar(emp: Empresa) {
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data, error } = await sb.from("leads").insert({
      user_id: user.id, nome: emp.nome, categoria: emp.categoria, cidade: emp.cidade, pais: emp.pais,
      telefone: emp.telefone, website: emp.website, instagram: emp.instagram, email: emp.email,
      fonte: "osm", osm_id: emp.osmId, score: emp.score, nivel: emp.nivel,
    }).select("id").single();
    if (!error && data) setSalvos((s) => new Set(s).add(emp.osmId));
    else if (error) setErro(error.code === "23505" ? `${emp.nome} já está salvo` : error.message);
  }

  async function salvarTodos() {
    if (!resultados) return;
    const lista = somenteInstagram ? resultados.filter(e => e.instagram) : resultados;
    const naoSalvos = lista.filter(e => !salvos.has(e.osmId));
    if (naoSalvos.length === 0) return;
    
    setCarregando(true);
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return setCarregando(false);
    
    for (const emp of naoSalvos) {
      const { error } = await sb.from("leads").insert({
        user_id: user.id, nome: emp.nome, categoria: emp.categoria, cidade: emp.cidade, pais: emp.pais,
        telefone: emp.telefone, website: emp.website, instagram: emp.instagram, email: emp.email,
        fonte: "osm", osm_id: emp.osmId, score: emp.score, nivel: emp.nivel,
      });
      if (!error || error.code === "23505") {
        setSalvos(s => new Set(s).add(emp.osmId));
      }
    }
    setCarregando(false);
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="eyebrow">Varredura global</p>
        <h1 className="headline mt-2 text-2xl font-bold">Buscar empresas</h1>
        <p className="mono mt-2 text-[11px] uppercase tracking-widest text-[var(--ink-faint)]">
          qualquer cidade · qualquer país · dados ao vivo do openstreetmap
        </p>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
        onSubmit={buscar} 
        className="panel mt-6 flex flex-wrap gap-2 rounded-2xl p-3"
      >
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
          className="field field-premium mono rounded-lg px-3 py-2 text-xs">
          <option value="todos">Todos os Comércios</option>
          {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input required value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade (ex: Lisboa)"
          className="field field-premium mono min-w-44 flex-1 rounded-lg px-3 py-2 text-xs" />
        <input value={pais} onChange={(e) => setPais(e.target.value)} placeholder="País (opcional)"
          className="field field-premium mono min-w-36 rounded-lg px-3 py-2 text-xs" />
        <button type="submit" disabled={carregando} className="btn-3d btn-3d-primary w-full md:w-auto mt-2 md:mt-0">
          {carregando ? "Varrendo..." : "▶ Varrer Mundo"}
        </button>
      </motion.form>

      <AnimatePresence>
        {erro && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mono mt-5 rounded-xl border border-[var(--alert)]/40 bg-[var(--alert)]/10 px-4 py-2.5 text-xs text-[var(--alert)]">
            ▸ {erro}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {carregando ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-16 flex flex-col items-center justify-center">
            <div className="radar mb-6" style={{ width: 80, height: 80, opacity: 0.8 }}>
              <div className="radar-sweep" />
            </div>
            <p className="mono text-xs uppercase tracking-widest text-[var(--ink-faint)]">
              consultando banco de dados global... (até 20s)
            </p>
          </motion.div>
        ) : resultados ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="mono text-[11px] uppercase tracking-widest text-[var(--ink-dim)]">
                · {somenteInstagram ? resultados.filter(e => e.instagram).length : resultados.length} alvos detectados — melhores primeiro
              </p>
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-8 h-4 rounded-full bg-white/5 border border-[var(--line-strong)] transition-colors group-hover:border-[#e879f9]/50">
                    <motion.div 
                      className="absolute w-3 h-3 rounded-full bg-[#e879f9]"
                      initial={false}
                      animate={{ x: somenteInstagram ? 8 : -8, opacity: somenteInstagram ? 1 : 0.4 }}
                    />
                  </div>
                  <input type="checkbox" className="hidden" checked={somenteInstagram} onChange={(e) => setSomenteInstagram(e.target.checked)} />
                  <span className={`mono text-[10px] uppercase tracking-widest transition-colors ${somenteInstagram ? 'text-[#e879f9]' : 'text-[var(--ink-faint)]'}`}>
                    só com Instagram
                  </span>
                </label>
                <button onClick={salvarTodos} disabled={carregando || (somenteInstagram ? resultados.filter(e => e.instagram) : resultados).every(e => salvos.has(e.osmId))}
                  className="btn-3d btn-3d-ghost">
                  + Salvar Todos
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {(somenteInstagram ? resultados.filter(e => e.instagram) : resultados).map((emp, i) => (
                <motion.div 
                  key={emp.osmId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.5) }}
                  className="lead-card flex flex-wrap items-center gap-4 p-4"
                  style={{ '--lead-accent': NIVEL_ACCENT[emp.nivel] } as React.CSSProperties}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="font-semibold tracking-tight">{emp.nome}</h2>
                      <span className={`badge ${NIVEL_ESTILO[emp.nivel]}`}>
                        {emp.nivel === "quente" ? "🔥" : emp.nivel === "morno" ? "💡" : "❄"} {emp.nivel} • {emp.score}
                      </span>
                    </div>
                    <p className="mono mt-1.5 text-[11px] leading-relaxed text-[var(--ink-dim)] flex flex-wrap gap-2">
                      <span>◎ {emp.endereco || emp.cidade}</span>
                      {emp.telefone && <span>• 📞 {emp.telefone}</span>}
                      {emp.website ? <span>• 🌐 tem site</span> : <span className="font-semibold text-[var(--signal)]">• 🚫 sem site ✔</span>}
                      {emp.instagram && <span className="text-[#e879f9]">• 💜 {emp.instagram}</span>}
                      {emp.email && <span>• ✉ {emp.email}</span>}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => checarRedes(emp)} disabled={!!checando}
                      className="btn-3d btn-3d-dark flex-1 md:flex-none" style={{ color: '#e879f9' }}>
                      {checando === emp.osmId ? "buscando..." : "🔍 Redes"}
                    </button>
                    <button onClick={() => salvar(emp)} disabled={salvos.has(emp.osmId)}
                      className="btn-3d btn-3d-primary flex-1 md:flex-none">
                      {salvos.has(emp.osmId) ? "✓ Travado" : "+ Travar"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
