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

const NIVEL_ESTILO: Record<Lead["nivel"], { borda: string; badge: string; icone: string }> = {
  quente: {
    borda: "border-l-[var(--alert)]",
    badge: "border-[var(--alert)]/50 bg-[var(--alert)]/10 text-[var(--alert)]",
    icone: "🔥",
  },
  morno: {
    borda: "border-l-[var(--amber)]",
    badge: "border-[var(--amber)]/50 bg-[var(--amber)]/10 text-[var(--amber)]",
    icone: "◐",
  },
  frio: {
    borda: "border-l-[var(--ink-faint)]",
    badge: "border-[var(--line-strong)] bg-white/5 text-[var(--ink-dim)]",
    icone: "○",
  },
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

  const contagem = {
    quente: visiveis.filter((l) => l.nivel === "quente").length,
    morno: visiveis.filter((l) => l.nivel === "morno").length,
    frio: visiveis.filter((l) => l.nivel === "frio").length,
  };

  return (
    <div>
      {/* Header + métricas */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Alvos travados</p>
          <h1 className="headline mt-2 text-2xl font-bold">
            Leads <span className="mono text-base font-normal text-[var(--ink-faint)]">({visiveis.length})</span>
          </h1>
        </div>
        <div className="mono flex gap-5 text-[11px] uppercase tracking-widest">
          <span className="text-[var(--alert)]">🔥 {contagem.quente} quentes</span>
          <span className="text-[var(--amber)]">◐ {contagem.morno} mornos</span>
          <span className="text-[var(--ink-faint)]">○ {contagem.frio} frios</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="panel mb-5 flex flex-wrap items-center gap-2 rounded-2xl p-3">
        <select value={fCat} onChange={(e) => setFCat(e.target.value)} className="field mono rounded-lg px-2.5 py-1.5 text-xs">
          <option value="all">Todas categorias</option>
          {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={fNivel} onChange={(e) => setFNivel(e.target.value)} className="field mono rounded-lg px-2.5 py-1.5 text-xs">
          <option value="all">Todos níveis</option><option value="quente">🔥 Quente</option><option value="morno">◐ Morno</option><option value="frio">○ Frio</option>
        </select>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="field mono rounded-lg px-2.5 py-1.5 text-xs">
          <option value="all">Todos status</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome/cidade..."
          className="field mono min-w-44 flex-1 rounded-lg px-3 py-1.5 text-xs" />
      </div>

      {aviso && (
        <p className="mono mb-4 rounded-xl border border-[var(--signal)]/30 bg-[var(--signal)]/8 px-4 py-2.5 text-xs text-[var(--signal)]">
          ▸ {aviso}
        </p>
      )}
      {carregando && (
        <p className="mono py-16 text-center text-xs uppercase tracking-widest text-[var(--ink-faint)]">
          <span className="pulse-dot mr-2 inline-block align-middle" /> varrendo a base...
        </p>
      )}
      {!carregando && visiveis.length === 0 && (
        <div className="panel rounded-2xl border-dashed py-20 text-center">
          <p className="mono text-xs uppercase tracking-widest text-[var(--ink-faint)]">radar limpo — nenhum lead nesta visão</p>
          <a href="/app/busca" className="mono mt-4 inline-block text-xs uppercase tracking-widest text-[var(--signal)] hover:underline">
            ▸ escanear uma cidade agora
          </a>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {visiveis.map((l) => {
          const est = NIVEL_ESTILO[l.nivel];
          return (
            <div key={l.id} className={`panel panel-hover rounded-2xl border-l-2 p-4 ${est.borda}`}>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-semibold tracking-tight">{l.nome}</h2>
                <span className={`badge ${est.badge}`}>{est.icone} {l.nivel} · {l.score}</span>
                <span className="badge border-[var(--line-strong)] text-[var(--ink-dim)]">
                  {CATEGORIAS.find((c) => c.id === l.categoria)?.label || l.categoria}
                </span>
                <span className="mono ml-auto text-[11px] uppercase tracking-widest text-[var(--ink-faint)]">
                  ◎ {l.cidade}{l.pais ? `, ${l.pais}` : ""}
                </span>
              </div>
              <div className="mono mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                {l.email ? (
                  <span className="flex items-center gap-1.5 text-[var(--ink)]">
                    <span className="text-[var(--signal)]">✉</span>
                    <input defaultValue={l.email} className="w-52 rounded border border-transparent bg-transparent outline-none transition hover:border-[var(--line-strong)] focus:border-[var(--signal)]" onBlur={(e) => e.target.value !== l.email && atualizar(l.id, { email: e.target.value })} />
                  </span>
                ) : <span className="text-[var(--ink-faint)]">✉ sem e-mail</span>}
                {l.instagram ? <span className="text-[#e879f9]">◆ @{l.instagram.replace("@", "")}</span> : <span className="text-[var(--ink-faint)]">◆ sem Instagram</span>}
                {l.website ? <span className="text-[var(--ink-faint)]">▣ tem site</span> : <span className="font-semibold text-[var(--signal)]">▣ sem site ✓</span>}
                <select value={l.status} onChange={(e) => atualizar(l.id, { status: e.target.value as Lead["status"] })}
                  className="field ml-auto rounded-lg px-2 py-1 text-[11px]">
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {msgAberta[l.id] && (
                <textarea value={msgAberta[l.id]} onChange={(e) => setMsgAberta((m) => ({ ...m, [l.id]: e.target.value }))}
                  rows={4}
                  className="field mt-3 w-full rounded-xl p-3.5 text-sm leading-relaxed" />
              )}
              <div className="mt-3.5 flex flex-wrap gap-2">
                <button onClick={() => gerar(l)} disabled={ocupado === l.id + ":gerar"}
                  className="btn-signal mono rounded-lg px-3.5 py-2 text-[10px] uppercase tracking-widest disabled:opacity-50">
                  {ocupado === l.id + ":gerar" ? "gerando..." : msgAberta[l.id] ? "↻ regerar" : "✦ gerar mensagem"}
                </button>
                {msgAberta[l.id] && (
                  <button onClick={() => navigator.clipboard.writeText(msgAberta[l.id])}
                    className="btn-ghost mono rounded-lg px-3.5 py-2 text-[10px] uppercase tracking-widest">
                    ⧉ copiar
                  </button>
                )}
                {l.email && msgAberta[l.id] && (
                  <button onClick={() => enviarEmail(l)} disabled={ocupado === l.id + ":email"}
                    className="mono rounded-lg bg-[var(--signal)]/15 px-3.5 py-2 text-[10px] uppercase tracking-widest text-[var(--signal)] shadow-[inset_0_0_0_1px_rgba(45,255,180,0.4)] transition hover:bg-[var(--signal)]/25 disabled:opacity-50">
                    {ocupado === l.id + ":email" ? "enviando..." : "✉ enviar e-mail"}
                  </button>
                )}
                <button onClick={() => abrirDM(l)}
                  className="mono rounded-lg bg-gradient-to-r from-[#833ab4]/80 via-[#d6249f]/80 to-[#fcaf45]/80 px-3.5 py-2 text-[10px] uppercase tracking-widest text-white transition hover:brightness-110">
                  ◆ abrir DM
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
