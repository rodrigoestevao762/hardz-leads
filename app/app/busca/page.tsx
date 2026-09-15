"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { CATEGORIAS } from "@/lib/categorias";

type Empresa = {
  osmId: string; nome: string; categoria: string; cidade: string; pais: string;
  telefone: string | null; website: string | null; instagram: string | null; email: string | null;
  endereco: string; score: number; nivel: "quente" | "morno" | "frio";
};

const NIVEL_COR: Record<Empresa["nivel"], string> = {
  quente: "bg-red-500/15 text-red-400 border-red-500/40",
  morno: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  frio: "bg-slate-500/15 text-slate-400 border-slate-500/40",
};

export default function BuscaPage() {
  const [categoria, setCategoria] = useState("barbearia");
  const [cidade, setCidade] = useState("");
  const [pais, setPais] = useState("");
  const [resultados, setResultados] = useState<Empresa[] | null>(null);
  const [salvos, setSalvos] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Buscar empresas</h1>
      <form onSubmit={buscar} className="mb-6 flex flex-wrap gap-2">
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
          className="rounded-lg border border-slate-600 bg-[#0b1020] px-3 py-2 text-sm">
          {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input required value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade (ex: Lisboa)"
          className="min-w-44 flex-1 rounded-lg border border-slate-600 bg-[#0b1020] px-3 py-2 text-sm outline-none focus:border-[#4f7cff]" />
        <input value={pais} onChange={(e) => setPais(e.target.value)} placeholder="País (opcional, ex: Portugal)"
          className="min-w-36 rounded-lg border border-slate-600 bg-[#0b1020] px-3 py-2 text-sm outline-none focus:border-[#4f7cff]" />
        <button type="submit" disabled={carregando}
          className="rounded-lg bg-[#4f7cff] px-5 py-2 font-semibold transition hover:bg-[#3d66e0] disabled:opacity-50">
          {carregando ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {erro && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{erro}</p>}
      {carregando && <p className="py-10 text-center text-slate-400">Consultando OpenStreetMap... (pode levar até 20s)</p>}

      {resultados && (
        <>
          <p className="mb-3 text-sm text-slate-400">{resultados.length} empresas encontradas — ordenadas por qualificação (melhores primeiro)</p>
          <div className="flex flex-col gap-3">
            {resultados.map((emp) => (
              <div key={emp.osmId} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-700/60 bg-[#111831] p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{emp.nome}</h2>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${NIVEL_COR[emp.nivel]}`}>{emp.nivel} · {emp.score}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {emp.endereco || emp.cidade}
                    {emp.telefone && <> · 📞 {emp.telefone}</>}
                    {emp.website && <> · 🌐 <span className="text-slate-500">tem site</span></>}
                    {!emp.website && <span className="text-emerald-400"> · 🌐 sem site ✓</span>}
                    {emp.instagram && <> · 📷 {emp.instagram}</>}
                    {emp.email && <> · ✉️ {emp.email}</>}
                  </p>
                </div>
                <button onClick={() => salvar(emp)} disabled={salvos.has(emp.osmId)}
                  className="rounded-lg bg-[#4f7cff] px-4 py-2 text-sm font-medium transition hover:bg-[#3d66e0] disabled:bg-emerald-600 disabled:opacity-80">
                  {salvos.has(emp.osmId) ? "✓ Salvo" : "+ Salvar"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
