"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type FoodResult = {
  osmId: string;
  nome: string;
  categoria: string;
  cidade: string;
  pais: string;
  telefone: string | null;
  website: string | null;
  instagram: string | null;
  email: string | null;
  fonte: string;
  score: number;
  nivel: "quente" | "morno" | "frio";
};

export default function FoodsRadarPage() {
  const [nicho, setNicho] = useState("");
  const [cidade, setCidade] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [resultados, setResultados] = useState<FoodResult[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvos, setSalvos] = useState<Set<string>>(new Set());

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true); setErro(null); setResultados(null); setSalvos(new Set());
    const res = await fetch("/api/buscar-foods", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nicho, cidade }),
    });
    const json = await res.json();
    setCarregando(false);
    if (!res.ok) return setErro(json.erro || "Erro na busca");
    setResultados(json.resultados);
  }

  async function salvar(emp: FoodResult) {
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data, error } = await sb.from("leads").insert({
      user_id: user.id, nome: emp.nome, categoria: emp.categoria, cidade: emp.cidade, pais: emp.pais,
      telefone: emp.telefone, website: emp.website, instagram: emp.instagram, email: emp.email,
      fonte: emp.fonte, osm_id: emp.osmId, score: emp.score, nivel: emp.nivel,
    }).select("id").single();
    if (!error && data) setSalvos((s) => new Set(s).add(emp.osmId));
    else if (error) setErro(error.code === "23505" ? `${emp.nome} já está salvo` : error.message);
  }

  async function salvarTodos() {
    if (!resultados) return;
    const naoSalvos = resultados.filter(e => !salvos.has(e.osmId));
    if (naoSalvos.length === 0) return;
    
    setCarregando(true);
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return setCarregando(false);
    
    for (const emp of naoSalvos) {
      const { error } = await sb.from("leads").insert({
        user_id: user.id, nome: emp.nome, categoria: emp.categoria, cidade: emp.cidade, pais: emp.pais,
        telefone: emp.telefone, website: emp.website, instagram: emp.instagram, email: emp.email,
        fonte: emp.fonte, osm_id: emp.osmId, score: emp.score, nivel: emp.nivel,
      });
      if (!error || error.code === "23505") {
        setSalvos(s => new Set(s).add(emp.osmId));
      }
    }
    setCarregando(false);
  }

  // Cores dinâmicas por fonte (ifood vermelho, ubereats verde, etc)
  function getFonteStyle(fonte: string) {
    if (fonte.includes('ifood')) return 'bg-red-500/20 text-red-500 border-red-500/30';
    if (fonte.includes('uber')) return 'bg-green-500/20 text-green-500 border-green-500/30';
    if (fonte.includes('glovo')) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    if (fonte.includes('tripadvisor')) return 'bg-[#34e0a1]/20 text-[#34e0a1] border-[#34e0a1]/30';
    if (fonte.includes('rappi')) return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
    if (fonte.includes('zomato')) return 'bg-red-600/20 text-red-600 border-red-600/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }

  return (
    <div>
      <p className="eyebrow text-[#ff4b4b]">Food Intelligence</p>
      <h1 className="headline mt-2 text-2xl font-bold bg-gradient-to-r from-[#ff4b4b] via-[#ff904b] to-[#ff4b4b] bg-clip-text text-transparent">Radar Foods 🍔</h1>
      <p className="mono mt-2 text-[11px] uppercase tracking-widest text-[var(--ink-faint)]">
        iFood · UberEats · Glovo · Rappi · TripAdvisor · Zomato
      </p>

      <form onSubmit={buscar} className="panel mt-6 flex flex-wrap gap-2 rounded-2xl p-3">
        <input value={nicho} onChange={(e) => setNicho(e.target.value)} placeholder="Nicho (ex: Hamburgueria, Sushi...)"
          className="field mono min-w-44 flex-1 rounded-lg px-3 py-2 text-xs" />
        <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Localidade (ex: São Paulo, Mundial)"
          className="field mono min-w-36 rounded-lg px-3 py-2 text-xs" />
        <button type="submit" disabled={carregando}
          className="button mono rounded-lg bg-gradient-to-r from-[#ff4b4b]/30 to-[#ff904b]/30 text-white px-6 py-2 text-[11px] uppercase tracking-widest hover:brightness-125 disabled:opacity-50">
          {carregando ? "hackeando menus..." : "🍕 caçar delivery"}
        </button>
      </form>

      {erro && (
        <p className="mono mt-5 rounded-xl border border-[var(--alert)]/40 bg-[var(--alert)]/10 px-4 py-2.5 text-xs text-[var(--alert)]">
          ⚠️ {erro}
        </p>
      )}
      {carregando && (
        <p className="mono py-16 text-center text-xs uppercase tracking-widest text-[var(--ink-faint)]">
          <span className="pulse-dot mr-2 inline-block align-middle bg-[#ff4b4b]" /> extraindo restaurantes... (isso pode levar 10s)
        </p>
      )}

      {resultados && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="mono text-[11px] uppercase tracking-widest text-[var(--ink-dim)]">
              · {resultados.length} restaurantes detectados
            </p>
            <div className="flex gap-4 items-center">
              <button onClick={salvarTodos} disabled={carregando || resultados.every(e => salvos.has(e.osmId))}
                className="btn-signal mono rounded-lg px-4 py-1.5 text-[10px] uppercase tracking-widest disabled:opacity-50">
                + salvar todos
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {resultados.map((emp) => (
              <div key={emp.osmId} className="panel panel-hover flex flex-wrap items-center gap-2 rounded-2xl p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-semibold tracking-tight">{emp.nome}</h2>
                    <span className={`mono rounded px-2 py-0.5 text-[9px] uppercase tracking-widest border ${getFonteStyle(emp.fonte)}`}>
                      {emp.fonte}
                    </span>
                  </div>
                  <p className="mono mt-1.5 text-[11px] leading-relaxed text-[var(--ink-dim)]">
                    {emp.cidade}
                    <a href={emp.website || "#"} target="_blank" rel="noreferrer" className="font-semibold text-[#ff904b] ml-2 hover:underline">
                       · 🔗 Acessar App
                    </a>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => salvar(emp)} disabled={salvos.has(emp.osmId)}
                    className="mono rounded-lg bg-[rgba(45,255,180,0.14)] px-4 py-2 text-[10px] uppercase tracking-widest text-[var(--signal)] shadow-[inset_0_0_0_1px_rgba(45,255,180,0.4)] transition hover:bg-[rgba(45,255,180,0.24)] disabled:opacity-60">
                    {salvos.has(emp.osmId) ? "✓ travado" : "+ travar alvo"}
                  </button>
                </div>
              </div>
            ))}
            {resultados.length === 0 && !carregando && (
              <p className="mono py-10 text-center text-xs uppercase tracking-widest text-[var(--ink-dim)]">
                Nenhum restaurante encontrado para esta busca.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
