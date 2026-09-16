"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type InstaResult = {
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

export default function InstaRadarPage() {
  const [nicho, setNicho] = useState("");
  const [cidade, setCidade] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [resultados, setResultados] = useState<InstaResult[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvos, setSalvos] = useState<Set<string>>(new Set());

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true); setErro(null); setResultados(null); setSalvos(new Set());
    const res = await fetch("/api/buscar-insta", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nicho, cidade }),
    });
    const json = await res.json();
    setCarregando(false);
    if (!res.ok) return setErro(json.erro || "Erro na busca");
    setResultados(json.resultados);
  }

  async function salvar(emp: InstaResult) {
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data, error } = await sb.from("leads").insert({
      user_id: user.id, nome: emp.nome, categoria: emp.categoria, cidade: emp.cidade, pais: emp.pais,
      telefone: emp.telefone, website: emp.website, instagram: emp.instagram, email: emp.email,
      fonte: "instagram", osm_id: emp.osmId, score: emp.score, nivel: emp.nivel,
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
        fonte: "instagram", osm_id: emp.osmId, score: emp.score, nivel: emp.nivel,
      });
      if (!error || error.code === "23505") {
        setSalvos(s => new Set(s).add(emp.osmId));
      }
    }
    setCarregando(false);
  }

  return (
    <div>
      <p className="eyebrow text-[#e879f9]">Inteligência OSINT</p>
      <h1 className="headline mt-2 text-2xl font-bold bg-gradient-to-r from-[#833ab4] via-[#d6249f] to-[#fcaf45] bg-clip-text text-transparent">Radar Instagram</h1>
      <p className="mono mt-2 text-[11px] uppercase tracking-widest text-[var(--ink-faint)]">
        varredura inversa direta por perfis do instagram na internet global
      </p>

      <form onSubmit={buscar} className="panel mt-6 flex flex-wrap gap-2 rounded-2xl p-3">
        <input value={nicho} onChange={(e) => setNicho(e.target.value)} placeholder="Nicho/Ramo (ex: Barbearia, ou deixe vazio para todos)"
          className="field mono min-w-44 flex-1 rounded-lg px-3 py-2 text-xs" />
        <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Localidade (ex: Lisboa, ou Mundial)"
          className="field mono min-w-36 rounded-lg px-3 py-2 text-xs" />
        <button type="submit" disabled={carregando}
          className="button mono rounded-lg bg-gradient-to-r from-[#833ab4]/30 via-[#d6249f]/30 to-[#fcaf45]/30 text-white px-6 py-2 text-[11px] uppercase tracking-widest hover:brightness-125 disabled:opacity-50">
          {carregando ? "hackeando..." : "🔍 caçar perfis"}
        </button>
      </form>

      {erro && (
        <p className="mono mt-5 rounded-xl border border-[var(--alert)]/40 bg-[var(--alert)]/10 px-4 py-2.5 text-xs text-[var(--alert)]">
          ⚠️ {erro}
        </p>
      )}
      {carregando && (
        <p className="mono py-16 text-center text-xs uppercase tracking-widest text-[var(--ink-faint)]">
          <span className="pulse-dot mr-2 inline-block align-middle bg-[#e879f9]" /> vasculhando a internet... (isso pode levar 10s)
        </p>
      )}

      {resultados && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="mono text-[11px] uppercase tracking-widest text-[var(--ink-dim)]">
              · {resultados.length} perfis encontrados
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
                  </div>
                  <p className="mono mt-1.5 text-[11px] leading-relaxed text-[var(--ink-dim)]">
                    {emp.cidade}
                    <span className="font-semibold text-[#e879f9] ml-2"> · 📷 {emp.instagram}</span>
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
                Nenhum perfil encontrado para esta busca. Tente mudar os termos.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
