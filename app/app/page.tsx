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
  const [copiado, setCopiado] = useState<Record<string, boolean>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const handleCopiar = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiado((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

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

    let username = l.instagram.trim().replace("@", "");
    if (username.includes("instagram.com/")) {
      username = username.split("instagram.com/")[1].split("/")[0].split("?")[0];
    }
    
    const usernamesBloqueados = ["tripadvisor", "ifood", "ifoodbrasil", "ubereats", "rappi", "zomato", "facebook", "duckduckgo", "google", "qwantcom", "yahoo", "bing"];
    if (usernamesBloqueados.includes(username.toLowerCase())) {
      return setAviso(`Este Instagram (${username}) é um falso positivo de uma busca anterior. Por favor, exclua ou re-enriqueça este lead.`);
    }

    window.open(`https://ig.me/m/${username}`, "_blank");
    atualizar(l.id, { status: "enviado", canal: "dm" });
  }

  async function abrirWhatsApp(l: Lead) {
    if (!l.telefone) return setAviso("Lead sem Telefone — edite e adicione o número.");
    if (!msgAberta[l.id]) return setAviso("Gere a mensagem primeiro antes de enviar.");
    navigator.clipboard.writeText(msgAberta[l.id]);
    const num = l.telefone.replace(/\D/g, "");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msgAberta[l.id])}`, "_blank");
    atualizar(l.id, { status: "enviado", canal: "dm" });
  }

  async function abrirFacebook(l: Lead) {
    if (!l.facebook) return setAviso("Lead sem Facebook.");
    if (!msgAberta[l.id]) return setAviso("Gere a mensagem primeiro antes de enviar.");
    navigator.clipboard.writeText(msgAberta[l.id]);
    window.open(l.facebook, "_blank");
    atualizar(l.id, { status: "enviado", canal: "dm" });
  }

  async function enriquecerLead(l: Lead, bulk = false) {
    if (!bulk) { setOcupado(l.id + ":enriquecer"); setAviso(null); }
    const res = await fetch("/api/enrich", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: l.id, nome: l.nome, cidade: l.cidade, pais: l.pais }),
    });
    const json = await res.json();
    if (!bulk) setOcupado(null);
    if (!res.ok) {
      if (!bulk) setAviso("Erro no enriquecimento: " + json.error);
      return;
    }
    setLeads((ls) => ls.map((lead) => (lead.id === l.id ? { ...lead, ...json.lead } : lead)));
    if (!bulk) setAviso(`Enriquecimento de ${l.nome} concluído com sucesso!`);
  }

  async function enriquecerEmLote() {
    const semInsta = visiveis.filter(l => !l.instagram && !l.email && !l.enriquecido_em);
    if (semInsta.length === 0) return setAviso("Nenhum lead visível precisa de enriquecimento.");
    if (!confirm(`Deseja acionar a IA para vasculhar a internet atrás dos contatos de ${semInsta.length} leads simultaneamente?`)) return;
    
    let sucessos = 0;
    const batchSize = 30; // Acelerado Mega Brain
    for (let i = 0; i < semInsta.length; i += batchSize) {
      const lote = semInsta.slice(i, i + batchSize);
      setAviso(`Enriquecendo lote... (${Math.min(i + batchSize, semInsta.length)}/${semInsta.length})`);
      
      await Promise.all(lote.map(async (l) => {
        setOcupado(l.id + ":enriquecer");
        await enriquecerLead(l, true);
      }));
      sucessos += lote.length;
    }
    
    setOcupado(null);
    setAviso(`Enriquecimento turbo concluído para ${sucessos} leads!`);
  }

  async function excluirLead(id: string) {
    const sb = supabaseBrowser();
    setOcupado(id + ":excluir");
    await sb.from("leads").delete().eq("id", id);
    setLeads((ls) => ls.filter((l) => l.id !== id));
    setOcupado(null);
  }

  async function limparSemRedes() {
    const sb = supabaseBrowser();
    const paraExcluir = visiveis.filter(l => !l.instagram);
    if (paraExcluir.length === 0) return setAviso("Nenhum lead sem Instagram encontrado.");
    if (!confirm(`Tem certeza que deseja excluir ${paraExcluir.length} leads sem Instagram?`)) return;
    
    setAviso(`Excluindo ${paraExcluir.length} leads...`);
    const ids = paraExcluir.map(l => l.id);
    await sb.from("leads").delete().in("id", ids);
    setLeads((ls) => ls.filter((l) => !ids.includes(l.id)));
    setAviso(`${paraExcluir.length} leads excluídos com sucesso.`);
  }

  async function gerarDMsEmLote() {
    const paraGerar = visiveis.filter(l => l.instagram && !msgAberta[l.id]);
    if (paraGerar.length === 0) return setAviso("Nenhum lead disponível para gerar mensagens (ou já geradas).");
    if (!confirm(`Deseja gerar mensagens persuasivas via IA para ${paraGerar.length} leads simultaneamente?`)) return;
    
    let sucessos = 0;
    
    // Para não estourar o limite de 15 RPM do Gemini Free (429 Too Many Requests), processamos 1 por 1 com 4.5s de delay
    const batchSize = 1;
    for (let i = 0; i < paraGerar.length; i += batchSize) {
      const lote = paraGerar.slice(i, i + batchSize);
      setAviso(`Gerando mensagens com IA (Evitando bloqueios)... (${Math.min(i + batchSize, paraGerar.length)}/${paraGerar.length})`);
      
      await Promise.all(lote.map(async (l) => {
        setOcupado(l.id + ":gerar");
        try {
          const res = await fetch("/api/gerar-mensagem", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: l.id }),
          });
          const json = await res.json();
          if (res.ok) {
            setMsgAberta((m) => ({ ...m, [l.id]: json.texto }));
            await atualizar(l.id, { status: "mensagem_gerada" });
            sucessos++;
          }
        } catch (err) {
          console.error(err);
        }
        setOcupado(null);
      }));
      // 4500ms garante no máximo ~13 requisições por minuto, evitando o fallback pro template em Português
      await new Promise(r => setTimeout(r, 4500));
    }
    
    setOcupado(null);
    setAviso(`DMs geradas para ${sucessos} leads!`);
  }

  async function limparTodos() {
    const sb = supabaseBrowser();
    if (visiveis.length === 0) return setAviso("Nenhum lead visível para excluir.");
    if (!confirm(`⚠️ ATENÇÃO: Você está prestes a EXCLUIR DEFINITIVAMENTE ${visiveis.length} leads da tela atual.\n\nTem certeza absoluta?`)) return;
    
    setAviso(`Excluindo ${visiveis.length} leads...`);
    const ids = visiveis.map((l) => l.id);
    
    // Delete in batches of 50 to avoid URL too long issues if there are many
    for (let i = 0; i < ids.length; i += 50) {
      const lote = ids.slice(i, i + 50);
      await sb.from("leads").delete().in("id", lote);
    }
    
    setLeads((ls) => ls.filter((l) => !ids.includes(l.id)));
    setAviso(`${visiveis.length} leads excluídos com sucesso.`);
  }

  async function disparoEmLote() {
    const paraEnviar = visiveis.filter(l => 
      l.email && 
      !l.email.includes("duckduckgo.com") && 
      ["novo", "mensagem_gerada"].includes(l.status)
    );
    if (paraEnviar.length === 0) return setAviso("Nenhum lead com e-mail válido disponível para envio.");
    if (!confirm(`Deseja disparar e-mails com IA para ${paraEnviar.length} leads simultaneamente?`)) return;
    
    let sucessos = 0;
    let ultErro = "";
    const batchSize = 15; // Acelerado

    for (let i = 0; i < paraEnviar.length; i += batchSize) {
      const lote = paraEnviar.slice(i, i + batchSize);
      setAviso(`Enviando e-mails turbo... (${Math.min(i + batchSize, paraEnviar.length)}/${paraEnviar.length})`);
      
      await Promise.all(lote.map(async (l) => {
        setOcupado(l.id + ":auto");
        try {
          const res = await fetch("/api/enviar-automatico", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: l.id }),
          });
          const json = await res.json();
          if (res.ok) {
            setMsgAberta((m) => ({ ...m, [l.id]: json.texto }));
            await atualizar(l.id, { status: "enviado", canal: "email" });
            sucessos++;
          } else {
            ultErro = json.erro || "Erro desconhecido";
          }
        } catch (err) {
          console.error(err);
        }
        setOcupado(null);
      }));
    }
    
    setOcupado(null);
    if (sucessos > 0) {
      setAviso(`Processamento turbo concluído! ${sucessos} e-mails disparados com sucesso.`);
    } else {
      setAviso(`Falha no disparo! Verifique a configuração de E-mail/Senha de App. Erro: ${ultErro}`);
    }
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
      <div className="mb-4 -mx-4 px-4 md:mx-0 md:px-0 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide snap-x">
        {ABAS.map((a) => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className={`mono shrink-0 snap-start rounded-lg px-3.5 py-2 text-[10px] uppercase tracking-widest transition ${
              aba === a.id
                ? "bg-[rgba(45,255,180,0.12)] text-[var(--signal)] shadow-[inset_0_0_0_1px_rgba(45,255,180,0.35)]"
                : "text-[var(--ink-dim)] hover:bg-white/5 hover:text-[var(--ink)]"
            }`}>
            {a.label}
            <span className={`ml-2 ${aba === a.id ? "text-[var(--signal)]" : "text-[var(--ink-faint)]"}`}>{contagemAba[a.id]}</span>
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
        <button onClick={disparoEmLote} disabled={!!ocupado} className="button bg-[#c9974c]/15 text-[#c9974c] rounded-lg px-4 py-1.5 text-xs font-semibold mono uppercase tracking-widest shadow-[inset_0_0_0_1px_rgba(201,151,76,0.35)] hover:bg-[#c9974c]/25 disabled:opacity-50">
          Disparo (E-mails)
        </button>
        <button onClick={gerarDMsEmLote} disabled={!!ocupado} className="button bg-gradient-to-r from-[#833ab4]/30 via-[#d6249f]/30 to-[#fcaf45]/30 text-white rounded-lg px-4 py-1.5 text-xs font-semibold mono uppercase tracking-widest hover:brightness-125 disabled:opacity-50">
          Gerar DMs (Insta)
        </button>
        <button onClick={limparSemRedes} disabled={!!ocupado} className="button bg-[var(--alert)]/10 text-[var(--alert)] rounded-lg px-4 py-1.5 text-xs font-semibold mono uppercase tracking-widest shadow-[inset_0_0_0_1px_var(--alert)] hover:bg-[var(--alert)]/20 disabled:opacity-50">
          Limpar s/ Insta
        </button>
        <button onClick={limparTodos} disabled={!!ocupado} className="button bg-black text-white rounded-lg px-4 py-1.5 text-xs font-semibold mono uppercase tracking-widest shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] hover:bg-white/10 disabled:opacity-50 transition">
          ⚠️ Limpar Tudo
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
                  <button onClick={() => handleCopiar(l.id, msgAberta[l.id])}
                    className="btn-ghost mono rounded-lg px-3.5 py-2 text-[10px] uppercase tracking-widest">
                    {copiado[l.id] ? "✅ copiado" : "⧉ copiar"}
                  </button>
                )}
                {l.instagram && (
                  <button onClick={() => abrirDM(l)}
                    className="mono rounded-lg bg-gradient-to-r from-[#833ab4]/80 via-[#d6249f]/80 to-[#fcaf45]/80 px-3.5 py-2 text-[10px] uppercase tracking-widest text-white transition hover:brightness-110">
                    📸 Instagram
                  </button>
                )}
                {l.telefone && (
                  <button onClick={() => abrirWhatsApp(l)}
                    className="mono rounded-lg bg-[#25D366]/80 px-3.5 py-2 text-[10px] uppercase tracking-widest text-white transition hover:brightness-110">
                    💬 WhatsApp
                  </button>
                )}
                {l.facebook && (
                  <button onClick={() => abrirFacebook(l)}
                    className="mono rounded-lg bg-[#1877F2]/80 px-3.5 py-2 text-[10px] uppercase tracking-widest text-white transition hover:brightness-110">
                    📘 Facebook
                  </button>
                )}
                <button onClick={() => router.push(`/app/editor/${l.id}`)}
                  className="mono rounded-lg bg-[#c9974c]/15 px-3.5 py-2 text-[10px] uppercase tracking-widest text-[#c9974c] shadow-[inset_0_0_0_1px_rgba(201,151,76,0.4)] transition hover:bg-[#c9974c]/25">
                  ✦ landing
                </button>
                <button onClick={() => excluirLead(l.id)} disabled={!!ocupado}
                  className="btn-ghost mono ml-auto rounded-lg px-3.5 py-2 text-[10px] uppercase tracking-widest text-[var(--alert)] transition hover:bg-[var(--alert)]/10 disabled:opacity-50">
                  {ocupado === l.id + ":excluir" ? "..." : "🗑 excluir"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
