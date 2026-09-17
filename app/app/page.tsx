"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
    
    // Processamento Turbo: lotes paralelos de 5 para máxima velocidade. 
    // Se o limite do Gemini Free (15 RPM) for atingido, o backend agora traduzirá os templates automaticamente sem delay.
    const batchSize = 5;
    for (let i = 0; i < paraGerar.length; i += batchSize) {
      const lote = paraGerar.slice(i, i + batchSize);
      setAviso(`Gerando mensagens voando... (${Math.min(i + batchSize, paraGerar.length)}/${paraGerar.length})`);
      
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
      // Apenas um respiro mínimo para o navegador não travar
      await new Promise(r => setTimeout(r, 100));
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

  const NIVEL_ACCENT: Record<Lead["nivel"], string> = {
    quente: "#ff5d5d",
    morno: "#ffb02d",
    frio: "#55685f",
  };

  return (
    <div>
      {/* Header + métricas */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-6 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="eyebrow">Alvos travados</p>
          <h1 className="headline mt-1 text-2xl font-bold">
            Leads <span className="mono text-base font-normal text-[var(--ink-faint)]">({visiveis.length})</span>
          </h1>
        </div>
        <div className="mono flex gap-4 text-[11px] uppercase tracking-widest flex-wrap">
          <span className="flex items-center gap-1.5 text-[var(--alert)]">
            <span className="pulse-dot" style={{ background: 'var(--alert)', boxShadow: '0 0 0 0 rgba(255,93,93,0.5)' }} />
            {contagem.quente} quentes
          </span>
          <span className="flex items-center gap-1.5 text-[var(--amber)]">
            <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--amber)', display:'inline-block' }} />
            {contagem.morno} mornos
          </span>
          <span className="flex items-center gap-1.5 text-[var(--ink-faint)]">
            <span style={{ width:7, height:7, borderRadius:'50%', border:'1px solid var(--ink-faint)', display:'inline-block' }} />
            {contagem.frio} frios
          </span>
        </div>
      </motion.div>

      {/* Abas de status com indicador deslizante */}
      <div className="mb-4 -mx-4 px-4 md:mx-0 md:px-0 flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide snap-x relative">
        {ABAS.map((a) => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className={`mono shrink-0 snap-start rounded-lg px-3.5 py-2 text-[10px] uppercase tracking-widest transition-all relative ${
              aba === a.id ? "text-[var(--signal)]" : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
            }`}
          >
            {aba === a.id && (
              <motion.span
                layoutId="aba-indicator"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'rgba(45,255,180,0.1)', border: '1px solid rgba(45,255,180,0.3)' }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{a.label}</span>
            <span className={`relative z-10 ml-2 ${aba === a.id ? "text-[var(--signal)]" : "text-[var(--ink-faint)]"}`}>{contagemAba[a.id]}</span>
          </button>
        ))}
      </div>

      {/* Filtros + Ações 3D */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="panel mb-5 flex flex-wrap items-center gap-2 rounded-2xl p-3"
      >
        <select value={fCat} onChange={(e) => setFCat(e.target.value)} className="field mono rounded-lg px-2.5 py-1.5 text-xs">
          <option value="all">Todas categorias</option>
          {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={fNivel} onChange={(e) => setFNivel(e.target.value)} className="field mono rounded-lg px-2.5 py-1.5 text-xs">
          <option value="all">Todos níveis</option><option value="quente">🔥 Quente</option><option value="morno">💡 Morno</option><option value="frio">❄ Frio</option>
        </select>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome/cidade..."
          className="field mono min-w-44 flex-1 rounded-lg px-3 py-1.5 text-xs" />
        <button onClick={enriquecerEmLote} disabled={!!ocupado} className="btn-3d btn-3d-ghost">
          ⚡ Enriquecer Lote
        </button>
        <button onClick={disparoEmLote} disabled={!!ocupado} className="btn-3d btn-3d-amber">
          ✉ Disparo E-mails
        </button>
        <button onClick={gerarDMsEmLote} disabled={!!ocupado} className="btn-3d btn-3d-insta">
          📸 Gerar DMs
        </button>
        <button onClick={limparSemRedes} disabled={!!ocupado} className="btn-3d btn-3d-dark">
          🗑 s/ Insta
        </button>
        <button onClick={limparTodos} disabled={!!ocupado} className="btn-3d btn-3d-danger">
          ⚠️ Limpar Tudo
        </button>
      </motion.div>

      {/* Aviso / Toast */}
      <AnimatePresence>
        {aviso && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="mono mb-4 flex items-center gap-2 rounded-xl border border-[var(--signal)]/25 bg-[var(--signal)]/6 px-4 py-3 text-xs text-[var(--signal)]"
          >
            <span className="pulse-dot shrink-0" />
            <span>{aviso}</span>
            <button onClick={() => setAviso(null)} className="ml-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {carregando && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mono py-16 text-center text-xs uppercase tracking-widest text-[var(--ink-faint)]"
        >
          <span className="pulse-dot mr-2 inline-block align-middle" /> varrendo a base...
        </motion.p>
      )}

      {/* Empty state */}
      {!carregando && visiveis.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="panel rounded-2xl border-dashed py-20 text-center"
        >
          <div className="mb-4 flex justify-center">
            <div className="radar" style={{ width: 60, height: 60, opacity: 0.5 }}>
              <div className="radar-sweep" />
            </div>
          </div>
          <p className="mono text-xs uppercase tracking-widest text-[var(--ink-faint)]">radar limpo — nenhum lead nesta visão</p>
          <a href="/app/busca" className="btn-3d btn-3d-ghost mt-6 inline-flex">
            ▸ escanear uma cidade agora
          </a>
        </motion.div>
      )}

      {/* Lead Cards */}
      <div className="flex flex-col gap-3">
        {visiveis.map((l, i) => {
          const est = NIVEL_ESTILO[l.nivel];
          const accent = NIVEL_ACCENT[l.nivel];
          return (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5), duration: 0.35, ease: "easeOut" }}
              className="lead-card p-4"
              style={{ '--lead-accent': accent } as React.CSSProperties}
            >
              {/* Header do card */}
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

              {/* Dados de contato */}
              <div className="mono mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                {l.email ? (
                  <span className="flex items-center gap-1.5 text-[var(--ink)]">
                    <span style={{ color: 'var(--signal)' }}>✉</span>
                    <input defaultValue={l.email} className="w-52 rounded border border-transparent bg-transparent outline-none transition hover:border-[var(--line-strong)] focus:border-[var(--signal)]" onBlur={(e) => e.target.value !== l.email && atualizar(l.id, { email: e.target.value })} />
                  </span>
                ) : <span className="text-[var(--ink-faint)]">✉ sem e-mail</span>}
                {l.instagram ? <span style={{ color: '#e879f9' }}>◆ @{l.instagram.replace("@", "")}</span> : <span className="text-[var(--ink-faint)]">◆ sem Instagram</span>}
                {l.website ? <span className="text-[var(--ink-faint)]">▣ tem site</span> : <span className="font-semibold text-[var(--signal)]">▣ sem site ✓</span>}
                <select value={l.status} onChange={(e) => atualizar(l.id, { status: e.target.value as Lead["status"] })}
                  className="field ml-auto rounded-lg px-2 py-1 text-[11px]">
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* Textarea de mensagem */}
              <AnimatePresence>
                {msgAberta[l.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <textarea value={msgAberta[l.id]} onChange={(e) => setMsgAberta((m) => ({ ...m, [l.id]: e.target.value }))}
                      rows={4}
                      className="field mt-3 w-full rounded-xl p-3.5 text-sm leading-relaxed" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botões de ação */}
              <div className="mt-3.5 flex flex-wrap gap-2">
                {l.email && l.status !== "enviado" && l.status !== "respondido" && l.status !== "cliente" && (
                  <button onClick={() => enviarAuto(l)} disabled={!!ocupado} className="btn-3d btn-3d-primary">
                    {ocupado === l.id + ":auto" ? "enviando..." : "⚡ Enviar E-mail"}
                  </button>
                )}
                {l.status === "enviado" && (
                  <span className="mono rounded-lg bg-[var(--signal)]/8 px-3.5 py-2 text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
                    ✓ {l.canal === "dm" ? "DM enviada" : "e-mail enviado"}
                  </span>
                )}
                <button onClick={() => enriquecerLead(l)} disabled={!!ocupado} className="btn-3d btn-3d-ghost" style={{ color: '#e879f9', borderColor: 'rgba(232,121,249,0.3)' }}>
                  {ocupado === l.id + ":enriquecer" ? "buscando..." : "🔍 Enriquecer"}
                </button>
                <button onClick={() => gerar(l)} disabled={!!ocupado} className="btn-3d btn-3d-ghost">
                  {ocupado === l.id + ":gerar" ? "gerando..." : msgAberta[l.id] ? "↻ Regerar" : "✦ Gerar Mensagem"}
                </button>
                {msgAberta[l.id] && (
                  <button onClick={() => handleCopiar(l.id, msgAberta[l.id])} className="btn-3d btn-3d-dark">
                    {copiado[l.id] ? "✅ copiado" : "⧉ Copiar"}
                  </button>
                )}
                {l.instagram && (
                  <button onClick={() => abrirDM(l)} className="btn-3d btn-3d-insta">
                    📸 Instagram
                  </button>
                )}
                {l.telefone && (
                  <button onClick={() => abrirWhatsApp(l)} className="btn-3d" style={{
                    background: 'linear-gradient(160deg, #25D366, #128C7E)',
                    color: '#fff',
                    boxShadow: '0 4px 0 #075E54, 0 8px 24px rgba(37,211,102,0.3)',
                  }}>
                    💬 WhatsApp
                  </button>
                )}
                {l.facebook && (
                  <button onClick={() => abrirFacebook(l)} className="btn-3d" style={{
                    background: 'linear-gradient(160deg, #4267B2, #1877F2)',
                    color: '#fff',
                    boxShadow: '0 4px 0 #1a3a7a, 0 8px 24px rgba(24,119,242,0.3)',
                  }}>
                    📘 Facebook
                  </button>
                )}
                <button onClick={() => router.push(`/app/editor/${l.id}`)} className="btn-3d btn-3d-amber">
                  ✦ Landing
                </button>
                <button onClick={() => excluirLead(l.id)} disabled={!!ocupado} className="btn-3d btn-3d-danger ml-auto">
                  {ocupado === l.id + ":excluir" ? "..." : "🗑 Excluir"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
