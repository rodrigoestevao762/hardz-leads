"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { CATEGORIAS } from "@/lib/categorias";

type Lead = {
  id: string;
  nome: string; categoria: string; cidade: string; pais: string;
  telefone: string | null; website: string | null; instagram: string | null; email: string | null;
  score: number; nivel: "quente" | "morno" | "frio";
  status: "novo" | "mensagem_gerada" | "enviado" | "respondido" | "cliente";
  canal: "email" | "dm" | null; notas: string | null;
};

const STATUS_LABEL: Record<Lead["status"], string> = {
  novo: "Novo", mensagem_gerada: "Msg gerada", enviado: "Enviado", respondido: "Respondido", cliente: "Cliente",
};
const NIVEL_COR: Record<Lead["nivel"], string> = {
  quente: "bg-red-500/15 text-red-400 border-red-500/40",
  morno: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  frio: "bg-slate-500/15 text-slate-400 border-slate-500/40",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [fCat, setFCat] = useState("all");
  const [fNivel, setFNivel] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [busca, setBusca] = useState("");
  const [msgAberta, setMsgAberta] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data } = await supabaseBrowser()
      .from("leads").select("*").order("score", { ascending: false }).order("nome");
    setLeads((data || []) as Lead[]);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const visiveis = useMemo(() => leads.filter((l) => {
    if (fCat !== "all" && l.categoria !== fCat) return false;
    if (fNivel !== "all" && l.nivel !== fNivel) return false;
    if (fStatus !== "all" && l.status !== fStatus) return false;
    if (busca && !(l.nome + " " + l.cidade + " " + l.pais).toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  }), [leads, fCat, fNivel, fStatus, busca]);

  async function atualizar(id: string, campos: Partial<Lead>) {
    await supabaseBrowser().from("leads").update(campos).eq("id", id);
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...campos } : l)));
  }

  async function gerar(l: Lead) {
    setOcupado(l.id + ":gerar"); setAviso(null);
    const res = await fetch("/api/gerar-mensagem", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: l.id }),
    });
    const json = await res.json();
    setOcupado(null);
    if (!res.ok) return setAviso("Erro: " + json.erro);
    setMsgAberta((m) => ({ ...m, [l.id]: json.texto }));
    if (l.status === "novo") atualizar(l.id, { status: "mensagem_gerada" });
  }

  async function enviarEmail(l: Lead) {
    const texto = msgAberta[l.id];
    if (!texto) return setAviso("Gere a mensagem primeiro");
    setOcupado(l.id + ":email"); setAviso(null);
    const res = await fetch("/api/enviar-email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: l.id, texto }),
    });
    const json = await res.json();
    setOcupado(null);
    if (!res.ok) return setAviso("Erro: " + json.erro);
    await atualizar(l.id, { status: "enviado", canal: "email" });
    setAviso(`E-mail enviado para ${l.email}`);
  }

  function abrirDM(l: Lead) {
    if (!l.instagram) return setAviso("Lead sem Instagram — cole o @ no campo e salve");
    navigator.clipboard.writeText(msgAberta[l.id] || "");
    window.open(`https://ig.me/m/${l.instagram.replace("@", "")}`, "_blank");
    atualizar(l.id, { status: "enviado", canal: "dm" });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-xl font-bold">Leads ({visiveis.length})</h1>
        <select value={fCat} onChange={(e) => setFCat(e.target.value)} className="rounded-lg border border-slate-600 bg-[#0b1020] px-2.5 py-1.5 text-sm">
          <option value="all">Todas categorias</option>
          {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={fNivel} onChange={(e) => setFNivel(e.target.value)} className="rounded-lg border border-slate-600 bg-[#0b1020] px-2.5 py-1.5 text-sm">
          <option value="all">Todos níveis</option><option value="quente">Quente</option><option value="morno">Morno</option><option value="frio">Frio</option>
        </select>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="rounded-lg border border-slate-600 bg-[#0b1020] px-2.5 py-1.5 text-sm">
          <option value="all">Todos status</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome/cidade..."
          className="min-w-40 flex-1 rounded-lg border border-slate-600 bg-[#0b1020] px-3 py-1.5 text-sm outline-none focus:border-[#4f7cff]" />
      </div>

      {aviso && <p className="mb-3 rounded-lg bg-[#4f7cff]/10 px-3 py-2 text-sm text-[#8fa9ff]">{aviso}</p>}
      {carregando && <p className="py-10 text-center text-slate-400">Carregando leads...</p>}
      {!carregando && visiveis.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-600 py-16 text-center text-slate-400">
          Nenhum lead ainda. <a href="/app/busca" className="text-[#4f7cff] hover:underline">Buscar empresas</a>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {visiveis.map((l) => (
          <div key={l.id} className="rounded-xl border border-slate-700/60 bg-[#111831] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">{l.nome}</h2>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${NIVEL_COR[l.nivel]}`}>{l.nivel} · {l.score}</span>
              <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs">{CATEGORIAS.find((c) => c.id === l.categoria)?.label || l.categoria}</span>
              <span className="ml-auto text-xs text-slate-400">{l.cidade}{l.pais ? `, ${l.pais}` : ""}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {l.email ? <span>✉️ <input defaultValue={l.email} className="w-52 rounded border border-transparent bg-transparent outline-none hover:border-slate-600 focus:border-[#4f7cff]" onBlur={(e) => e.target.value !== l.email && atualizar(l.id, { email: e.target.value })} /></span> : <span className="text-slate-500">✉️ sem e-mail</span>}
              {l.instagram ? <span>📷 @{l.instagram.replace("@", "")}</span> : <span className="text-slate-500">📷 sem Instagram</span>}
              {l.website ? <span className="text-slate-500" title={l.website}>🌐 tem site</span> : <span className="text-emerald-400">🌐 sem site ✓</span>}
              <select value={l.status} onChange={(e) => atualizar(l.id, { status: e.target.value as Lead["status"] })}
                className="ml-auto rounded-lg border border-slate-600 bg-[#0b1020] px-2 py-1 text-xs">
                {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {msgAberta[l.id] && (
              <textarea value={msgAberta[l.id]} onChange={(e) => setMsgAberta((m) => ({ ...m, [l.id]: e.target.value }))}
                rows={4}
                className="mt-3 w-full rounded-lg border border-slate-600 bg-[#0b1020] p-3 text-sm outline-none focus:border-[#4f7cff]" />
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => gerar(l)} disabled={ocupado === l.id + ":gerar"}
                className="rounded-lg bg-[#4f7cff] px-3 py-1.5 text-sm font-medium transition hover:bg-[#3d66e0] disabled:opacity-50">
                {ocupado === l.id + ":gerar" ? "Gerando..." : msgAberta[l.id] ? "↻ Gerar novamente" : "✨ Gerar mensagem"}
              </button>
              {msgAberta[l.id] && (
                <button onClick={() => navigator.clipboard.writeText(msgAberta[l.id])}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm transition hover:bg-slate-700/40">
                  📋 Copiar
                </button>
              )}
              {l.email && msgAberta[l.id] && (
                <button onClick={() => enviarEmail(l)} disabled={ocupado === l.id + ":email"}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium transition hover:bg-emerald-500 disabled:opacity-50">
                  {ocupado === l.id + ":email" ? "Enviando..." : "✉️ Enviar e-mail"}
                </button>
              )}
              <button onClick={() => abrirDM(l)}
                className="rounded-lg bg-[#d6249f] px-3 py-1.5 text-sm font-medium transition hover:bg-[#b01d85]">
                💬 Abrir DM
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
