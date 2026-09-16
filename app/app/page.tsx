"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { CATEGORIAS } from "@/lib/categorias";

type Lead = {
  id: string;
  nome: string; categoria: string; cidade: string; pais: string;
  telefone: string | null; website: string | null; instagram: string | null; email: string | null;
  facebook: string | null; fontes: string[]; enriquecido_em: string | null;
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

const ABAS: { id: string; label: string; statuses: Lead["status"][] | null }[] = [
  { id: "contato", label: "Para contato", statuses: ["novo", "mensagem_gerada"] },
  { id: "enviado", label: "Enviados", statuses: ["enviado"] },
  { id: "respondido", label: "Respondidos", statuses: ["respondido"] },
  { id: "cliente", label: "Clientes", statuses: ["cliente"] },
  { id: "all", label: "Todos", statuses: null },
];

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [fCat, setFCat] = useState("all");
  const [fNivel, setFNivel] = useState("all");
  const [aba, setAba] = useState("contato");
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

  const visiveis = useMemo(() => {
    const abaAtual = ABAS.find((a) => a.id === aba)!;
    return leads.filter((l) => {
      if (abaAtual.statuses && !abaAtual.statuses.includes(l.status)) return false;
      if (fCat !== "all" && l.categoria !== fCat) return false;
      if (fNivel !== "all" && l.nivel !== fNivel) return false;
      if (busca && !(l.nome + " " + l.cidade + " " + l.pais).toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [leads, aba, fCat, fNivel, busca]);

  const contagemAba = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of ABAS) {
      m[a.id] = a.statuses ? leads.filter((l) => a.statuses!.includes(l.status)).length : leads.length;
    }
    return m;
  }, [leads]);

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

  async function enviarAuto(l: Lead) {
    setOcupado(l.id + ":auto"); setAviso(null);
    const res = await fetch("/api/enviar-automatico", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: l.id }),
    });
    const json = await res.json();
    setOcupado(null);
    if (!res.ok) return setAviso("Erro: " + json.erro);
    setMsgAberta((m) => ({ ...m, [l.id]: json.texto }));
    await atualizar(l.id, { status: "enviado", canal: "email" });
    setAviso(`✓ e-mail enviado para ${l.email} — o lead saiu de "Para contato" e entrou em "Enviados"`);
  }

  async function abrirDM(l: Lead) {
    if (!l.instagram) return setAviso("Lead sem Instagram — cole o @ no campo e salve");
    if (!msgAberta[l.id]) {
      setOcupado(l.id + ":gerar"); setAviso(null);
      const res = await fetch("/api/gerar-mensagem", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: l.id }),
      });
      const json = await res.json();
      setOcupado(null);
      if (!res.ok) return setAviso("Erro: " + json.erro);
      setMsgAberta((m) => ({ ...m, [l.id]: json.texto }));
      if (l.status === "novo") atualizar(l.id, { status: "mensagem_gerada" });
      navigator.clipboard.writeText(json.texto);
    } else {
      navigator.clipboard.writeText(msgAberta[l.id]);
    }
    window.open(`https://ig.me/m/${l.instagram.replace("@", "")}`, "_blank");
    atualizar(l.id, { status: "enviado", canal: "dm" });
  }

  async function enriquecerLead(l: Lead) {
    setOcupado(l.id + ":enriquecer"); setAviso(null);
    const res = await fetch("/api/enrich", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: l.id, nome: l.nome, cidade: l.cidade, pais: l.pais }),
    });
    const json = await res.json();
    setOcupado(null);
    if (!res.ok) return setAviso("Erro no enriquecimento: " + json.error);
    setLeads((ls) => ls.map((lead) => (lead.id === l.id ? { ...lead, ...json.lead } : lead)));
    setAviso(`Enriquecimento de ${l.nome} concluído com sucesso!`);
  }

  async function enriquecerEmLote() {
    const leadsParaEnriquecer = visiveis.filter(l => !l.instagram && !l.email && !l.enriquecido_em).slice(0, 5); // enriquecendo 5 por vez
    if (leadsParaEnriquecer.length === 0) return setAviso("Nenhum lead visível precisa de enriquecimento.");
    
    setAviso(`Enriquecendo ${leadsParaEnriquecer.length} leads...`);
    for (const l of leadsParaEnriquecer) {
      await enriquecerLead(l);
    }
    setAviso(`Enriquecimento em lote concluído!`);
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

      {/* Abas de status */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {ABAS.map((a) => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className={`mono rounded-lg px-3.5 py-2 text-[10px] uppercase tracking-widest transition ${
              aba === a.id
                ? "bg-[rgba(45,255,180,0.12)] text-[var(--signal)] shadow-[inset_0_0_0_1px_rgba(45,255,180,0.35)]"
                : "text-[var(--ink-dim)] hover:bg-white/5 hover:text-[var(--ink)]"
            }`}>
            {a.label}
            <span className="ml-2 text-[var(--ink-faint)]">{contagemAba[a.id]}</span>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="panel mb-5 flex flex-wrap items-center gap-2 rounded-2xl p-3">
        <select value={fCat} onChange={(e) => setFCat(e.target.value)} className="field mono rounded-lg px-2.5 py-1.5 text-xs">
          <option value="all">Todas categorias</option>
          {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={fNivel} onChange={(e) => setFNivel(e.target.value)} className="field mono rounded-lg px-2.5 py-1.5 text-xs">
          <option value="all">Todos níveis</option><option value="quente">🔥 Quente</option><option value="morno">💡 Morno</option><option value="frio">❄ Frio</option>
        </select>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome/cidade..."
          className="field mono min-w-44 flex-1 rounded-lg px-3 py-1.5 text-xs" />
        <button onClick={enriquecerEmLote} disabled={!!ocupado} className="button bg-[rgba(45,255,180,0.12)] text-[var(--signal)] rounded-lg px-4 py-1.5 text-xs font-semibold mono uppercase tracking-widest shadow-[inset_0_0_0_1px_rgba(45,255,180,0.35)] hover:bg-[rgba(45,255,180,0.2)] disabled:opacity-50">
          Enriquecer Lote
        </button>
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
                {l.email && l.status !== "enviado" && l.status !== "respondido" && l.status !== "cliente" && (
                  <button onClick={() => enviarAuto(l)} disabled={!!ocupado}
                    className="mono rounded-lg bg-[var(--signal)]/15 px-3.5 py-2 text-[10px] uppercase tracking-widest text-[var(--signal)] shadow-[inset_0_0_0_1px_rgba(45,255,180,0.4)] transition hover:bg-[var(--signal)]/25 disabled:opacity-50">
                    {ocupado === l.id + ":auto" ? "enviando..." : "⚡ enviar e-mail"}
                  </button>
                )}
                {l.status === "enviado" && (
                  <span className="mono rounded-lg bg-[var(--signal)]/8 px-3.5 py-2 text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
                    ✓ {l.canal === "dm" ? "DM enviada" : "e-mail enviado"}
                  </span>
                )}
                <button onClick={() => enriquecerLead(l)} disabled={!!ocupado}
                  className="btn-ghost mono rounded-lg px-3.5 py-2 text-[10px] uppercase tracking-widest text-[#e879f9] transition hover:bg-white/5 disabled:opacity-50">
                  {ocupado === l.id + ":enriquecer" ? "buscando..." : "🔍 enriquecer"}
                </button>
                <button onClick={() => gerar(l)} disabled={!!ocupado}
                  className="btn-ghost mono rounded-lg px-3.5 py-2 text-[10px] uppercase tracking-widest disabled:opacity-50">
                  {ocupado === l.id + ":gerar" ? "gerando..." : msgAberta[l.id] ? "↻ regerar" : "✦ gerar mensagem"}
                </button>
                {msgAberta[l.id] && (
                  <button onClick={() => navigator.clipboard.writeText(msgAberta[l.id])}
                    className="btn-ghost mono rounded-lg px-3.5 py-2 text-[10px] uppercase tracking-widest">
                    ⧉ copiar
                  </button>
                )}
                <button onClick={() => abrirDM(l)}
                  className="mono rounded-lg bg-gradient-to-r from-[#833ab4]/80 via-[#d6249f]/80 to-[#fcaf45]/80 px-3.5 py-2 text-[10px] uppercase tracking-widest text-white transition hover:brightness-110">
                  ◆ abrir DM
                </button>
                <button onClick={() => router.push(`/app/editor/${l.id}`)}
                  className="mono rounded-lg bg-[#c9974c]/15 px-3.5 py-2 text-[10px] uppercase tracking-widest text-[#c9974c] shadow-[inset_0_0_0_1px_rgba(201,151,76,0.4)] transition hover:bg-[#c9974c]/25">
                  ✦ landing
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
