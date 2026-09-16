"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { buildLandingHTML, textosPadrao, type DadosLanding, type TextosLanding } from "@/lib/landing";

type Lead = {
  nome: string; categoria: string; cidade: string; pais: string;
  telefone: string | null; website: string | null; instagram: string | null; email: string | null; endereco: string | null;
};

// define valor profundo no estado a partir do caminho "servicos.0.titulo"
function setarProfundo<T extends object>(obj: T, caminho: string, valor: string): T {
  const chaves = caminho.split(".");
  const clone: Record<string, unknown> = Array.isArray(obj)
    ? ([...(obj as unknown as unknown[])] as unknown as Record<string, unknown>)
    : { ...(obj as unknown as Record<string, unknown>) };
  let alvo = clone;
  for (let i = 0; i < chaves.length - 1; i++) {
    const k = chaves[i];
    const proximo = alvo[k] as Record<string, unknown>;
    alvo[k] = Array.isArray(proximo) ? [...proximo] : { ...proximo };
    alvo = alvo[k] as Record<string, unknown>;
  }
  alvo[chaves[chaves.length - 1]] = valor;
  return clone as T;
}

export default function EditorLanding() {
  const params = useParams<{ leadId: string }>();
  const leadId = params.leadId;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [lead, setLead] = useState<Lead | null>(null);
  const [textos, setTextos] = useState<TextosLanding | null>(null);
  const [accent, setAccent] = useState("#c9974c");
  const [tema, setTema] = useState<"escuro" | "claro">("escuro");
  const [estado, setEstado] = useState<"carregando" | "sem-landing" | "pronto">("carregando");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const carregar = useCallback(async () => {
    setEstado("carregando");
    const sb = supabaseBrowser();
    const { data: l } = await sb.from("leads").select("*").eq("id", leadId).single();
    if (!l) { setEstado("sem-landing"); return; }
    setLead(l as Lead);
    const { data: landing } = await sb.from("landings").select("*").eq("lead_id", leadId).single();
    if (landing?.textos && Object.keys(landing.textos).length > 0) {
      setTextos(landing.textos as TextosLanding);
      setAccent(landing.accent || "#c9974c");
      setTema(landing.tema || "escuro");
      setEstado("pronto");
    } else {
      setEstado("sem-landing");
    }
  }, [leadId]);

  useEffect(() => { carregar(); }, [carregar]);

  const dados: DadosLanding | null = lead
    ? {
        nome: lead.nome,
        categoriaLabel: lead.categoria,
        cidade: lead.cidade,
        telefone: lead.telefone,
        email: lead.email,
        instagram: lead.instagram,
        endereco: lead.endereco,
      }
    : null;

  const html = dados && textos ? buildLandingHTML(dados, textos, accent, tema) : "";

  // habilita edição inline dentro do iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;
    const aoCarregar = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.body.contentEditable = "true";
      doc.body.style.outline = "none";
      doc.addEventListener("focusout", () => {
        const ativo = doc.activeElement as HTMLElement | null;
        const alvo = ativo?.closest?.("[data-campo]") as HTMLElement | null;
        if (!alvo) return;
        const caminho = alvo.getAttribute("data-campo");
        const novo = (alvo.textContent || "").trim();
        if (!caminho || !textos) return;
        const atual = caminho.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], textos);
        if (atual !== novo) setTextos((t) => (t ? setarProfundo(t, caminho, novo) : t));
      });
    };
    iframe.addEventListener("load", aoCarregar);
    if (iframe.contentDocument?.readyState === "complete") aoCarregar();
    return () => iframe.removeEventListener("load", aoCarregar);
  }, [html, textos]);

  async function gerar() {
    setOcupado("gerar"); setAviso(null);
    const res = await fetch("/api/gerar-landing", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId }),
    });
    const json = await res.json();
    setOcupado(null);
    if (!res.ok) return setAviso("Erro: " + json.erro);
    setTextos(json.textos);
    setEstado("pronto");
  }

  async function salvar() {
    if (!textos) return;
    setOcupado("salvar"); setAviso(null);
    const res = await fetch("/api/salvar-landing", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, textos, accent, tema }),
    });
    const json = await res.json();
    setOcupado(null);
    if (!res.ok) return setAviso("Erro: " + json.erro);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  function baixar() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `landing-${(lead?.nome || "lead").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (estado === "carregando") {
    return (
      <p className="mono py-16 text-center text-xs uppercase tracking-widest text-[var(--ink-faint)]">
        <span className="pulse-dot mr-2 inline-block align-middle" /> carregando editor...
      </p>
    );
  }

  if (estado === "sem-landing" || !lead || !dados) {
    return (
      <div className="panel mx-auto max-w-md rounded-2xl p-10 text-center">
        <p className="eyebrow">Landing page</p>
        <h1 className="headline mt-3 text-xl font-bold">{lead?.nome || "Lead"}</h1>
        <p className="mono mt-4 text-[11px] uppercase tracking-widest text-[var(--ink-faint)]">
          ainda não tem uma landing gerada
        </p>
        <button onClick={gerar} disabled={ocupado === "gerar"}
          className="btn-signal mono mt-7 rounded-xl px-6 py-3 text-[11px] uppercase tracking-widest disabled:opacity-50">
          {ocupado === "gerar" ? "gerando com IA..." : "✦ gerar com IA"}
        </button>
        {aviso && <p className="mono mt-4 text-xs text-[var(--alert)]">{aviso}</p>}
        <p className="mt-6">
          <Link href="/app" className="mono text-[11px] uppercase tracking-widest text-[var(--ink-dim)] hover:text-[var(--signal)]">← voltar aos leads</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Barra de ferramentas */}
      <div className="panel mb-4 flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <div className="mr-2">
          <p className="eyebrow">Editor de landing</p>
          <h1 className="text-sm font-semibold">{lead.nome}</h1>
        </div>

        <label className="mono flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">
          Cor
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-[var(--line)] bg-transparent" />
        </label>

        <select value={tema} onChange={(e) => setTema(e.target.value as "escuro" | "claro")}
          className="field mono rounded-lg px-2.5 py-1.5 text-xs">
          <option value="escuro">Tema escuro</option>
          <option value="claro">Tema claro</option>
        </select>

        <span className="mono hidden text-[10px] uppercase tracking-widest text-[var(--ink-faint)] lg:inline">
          ▸ clique em qualquer texto no preview para editar
        </span>

        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={gerar} disabled={!!ocupado}
            className="btn-ghost mono rounded-lg px-3.5 py-2 text-[10px] uppercase tracking-widest disabled:opacity-50">
            {ocupado === "gerar" ? "gerando..." : "↻ regerar com IA"}
          </button>
          <button onClick={baixar}
            className="btn-ghost mono rounded-lg px-3.5 py-2 text-[10px] uppercase tracking-widest">
            ↓ baixar html
          </button>
          <button onClick={salvar} disabled={!!ocupado}
            className="btn-signal mono rounded-lg px-4 py-2 text-[10px] uppercase tracking-widest disabled:opacity-50">
            {ocupado === "salvar" ? "salvando..." : salvo ? "✓ salvo" : "salvar"}
          </button>
        </div>
      </div>

      {aviso && (
        <p className="mono mb-4 rounded-xl border border-[var(--alert)]/40 bg-[var(--alert)]/10 px-4 py-2.5 text-xs text-[var(--alert)]">
          ▸ {aviso}
        </p>
      )}

      {/* Preview */}
      <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
        <iframe ref={iframeRef} srcDoc={html} title="Pré-visualização da landing"
          sandbox="allow-same-origin"
          className="h-[78vh] w-full bg-white" />
      </div>
      <p className="mono mt-3 text-center text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
        as alterações no texto são aplicadas na hora — clique em salvar para guardar
      </p>
    </div>
  );
}
