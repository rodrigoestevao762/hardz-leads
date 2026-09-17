"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { buildLandingHTML, type DadosLanding, type TextosLanding } from "@/lib/landing";

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
  const [srcDoc, setSrcDoc] = useState("");
  const [estado, setEstado] = useState<"carregando" | "sem-landing" | "pronto">("carregando");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [publicaUrl, setPublicaUrl] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // refs para os handlers dentro do iframe lerem o valor mais recente
  const textosRef = useRef<TextosLanding | null>(null);
  textosRef.current = textos;

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

  const reconstruir = useCallback(
    (t: TextosLanding, a: string, tm: "escuro" | "claro", d: DadosLanding) => {
      setSrcDoc(buildLandingHTML(d, t, a, tm));
    },
    []
  );

  const carregar = useCallback(async () => {
    setEstado("carregando");
    const sb = supabaseBrowser();
    const { data: l } = await sb.from("leads").select("*").eq("id", leadId).single();
    if (!l) { setEstado("sem-landing"); return; }
    const ld = l as Lead;
    setLead(ld);
    const { data: landing } = await sb.from("landings").select("*").eq("lead_id", leadId).single();
    if (landing?.textos && Object.keys(landing.textos).length > 0) {
      const t = landing.textos as TextosLanding;
      const a = landing.accent || "#c9974c";
      const tm = (landing.tema === "claro" ? "claro" : "escuro") as "escuro" | "claro";
      setTextos(t);
      setAccent(a);
      setTema(tm);
      if (landing.publicada && landing.slug) {
        setPublicaUrl(`${window.location.origin}/s/${landing.slug}`);
      }
      reconstruir(
        t, a, tm,
        { nome: ld.nome, categoriaLabel: ld.categoria, cidade: ld.cidade, telefone: ld.telefone, email: ld.email, instagram: ld.instagram, endereco: ld.endereco }
      );
      setEstado("pronto");
    } else {
      setEstado("sem-landing");
    }
  }, [leadId, reconstruir]);

  useEffect(() => { carregar(); }, [carregar]);

  // habilita edição inline dentro do iframe (uma vez por carga do documento)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !srcDoc) return;
    const aoCarregar = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.body.contentEditable = "true";
      doc.body.style.outline = "none";
      // com contentEditable o foco fica no body (host de edição), então detectamos
      // as edições pelo evento "input", que traz o elemento real em e.target
      doc.addEventListener("input", (e) => {
        const alvo = (e.target as HTMLElement | null)?.closest?.("[data-campo]") as HTMLElement | null;
        if (!alvo) return;
        const caminho = alvo.getAttribute("data-campo");
        const novo = (alvo.textContent || "").trim();
        const t = textosRef.current;
        if (!caminho || !t) return;
        const atual = caminho.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], t);
        if (atual !== novo) setTextos(setarProfundo(t, caminho, novo));
      });
    };
    iframe.addEventListener("load", aoCarregar);
    if (iframe.contentDocument?.readyState === "complete") aoCarregar();
    return () => iframe.removeEventListener("load", aoCarregar);
  }, [srcDoc]);

  async function gerar() {
    setOcupado("gerar"); setAviso(null);
    const res = await fetch("/api/gerar-landing", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId }),
    });
    const json = await res.json();
    setOcupado(null);
    if (!res.ok) return setAviso("Erro: " + json.erro);
    const t = json.textos as TextosLanding;
    setTextos(t);
    if (dados) reconstruir(t, accent, tema, dados);
    setEstado("pronto");
  }

  async function salvarAgora(): Promise<boolean> {
    if (!textos) return false;
    const res = await fetch("/api/salvar-landing", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, textos, accent, tema }),
    });
    const json = await res.json();
    if (!res.ok) { setAviso("Erro: " + json.erro); return false; }
    return true;
  }

  async function salvar() {
    setOcupado("salvar"); setAviso(null);
    const ok = await salvarAgora();
    setOcupado(null);
    if (ok) { setSalvo(true); setTimeout(() => setSalvo(false), 2500); }
  }

  async function publicar() {
    setOcupado("publicar"); setAviso(null);
    const ok = await salvarAgora();
    if (!ok) { setOcupado(null); return; }
    const res = await fetch("/api/publicar-landing", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    const json = await res.json();
    setOcupado(null);
    if (!res.ok) return setAviso("Erro: " + json.erro);
    setPublicaUrl(json.url);
  }

  async function despublicar() {
    setOcupado("despublicar"); setAviso(null);
    const res = await fetch("/api/publicar-landing", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, publicar: false }),
    });
    const json = await res.json();
    setOcupado(null);
    if (!res.ok) return setAviso("Erro: " + json.erro);
    setPublicaUrl(null);
  }

  function copiar() {
    if (!publicaUrl) return;
    navigator.clipboard.writeText(publicaUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function baixar() {
    if (!textos || !dados) return;
    const html = buildLandingHTML(dados, textos, accent, tema);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `landing-${(lead?.nome || "lead").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function trocarCor(v: string) {
    setAccent(v);
    if (textos && dados) reconstruir(textos, v, tema, dados);
  }

  function trocarTema(v: "escuro" | "claro") {
    setTema(v);
    if (textos && dados) reconstruir(textos, accent, v, dados);
  }

  if (estado === "carregando") {
    return (
      <p className="mono py-16 text-center text-xs uppercase tracking-widest text-[var(--ink-faint)]">
        <span className="pulse-dot mr-2 inline-block align-middle" /> inicializando motor de edição...
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
          className="btn-3d btn-3d-primary mt-7 py-3 px-6 text-[11px] disabled:opacity-50">
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Barra de ferramentas */}
      <div className="panel mb-4 flex flex-wrap items-center gap-3 rounded-2xl p-3 bg-black/40 backdrop-blur-md border border-white/5">
        <div className="mr-2">
          <p className="eyebrow">Editor neural</p>
          <h1 className="text-sm font-semibold">{lead.nome}</h1>
        </div>

        <label className="mono flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--ink-dim)] bg-white/5 rounded-lg px-2 py-1">
          Cor
          <input type="color" value={accent} onChange={(e) => trocarCor(e.target.value)}
            className="h-6 w-8 cursor-pointer rounded border border-[var(--line)] bg-transparent" />
        </label>

        <select value={tema} onChange={(e) => trocarTema(e.target.value as "escuro" | "claro")}
          className="field-premium mono rounded-lg px-2.5 py-1.5 text-[10px] outline-none">
          <option value="escuro">Tema escuro</option>
          <option value="claro">Tema claro</option>
        </select>

        <span className="mono hidden text-[10px] uppercase tracking-widest text-[var(--ink-faint)] lg:inline ml-2">
          ▸ clique no texto do preview para reescrever
        </span>

        <div className="ml-auto flex flex-wrap gap-2 items-center">
          <button onClick={gerar} disabled={!!ocupado}
            className="btn-3d btn-3d-ghost py-1.5 px-3 text-[9px] disabled:opacity-50">
            {ocupado === "gerar" ? "gerando..." : "↻ regerar"}
          </button>
          <button onClick={baixar}
            className="btn-3d btn-3d-ghost py-1.5 px-3 text-[9px]">
            ↓ baixar
          </button>
          <button onClick={salvar} disabled={!!ocupado}
            className="btn-3d btn-3d-primary py-1.5 px-4 text-[9px] disabled:opacity-50">
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
      <div className="overflow-hidden rounded-2xl border border-[var(--signal)]/30 shadow-[0_0_30px_rgba(56,189,248,0.05)] bg-[#030603]">
        <iframe ref={iframeRef} srcDoc={srcDoc} title="Pré-visualização da landing"
          sandbox="allow-same-origin"
          className="h-[75vh] w-full bg-white transition-opacity duration-300" />
      </div>
      <p className="mono mt-3 text-center text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
        as alterações no texto são aplicadas em real-time — grave no banco clicando em salvar
      </p>

      {/* Publicação */}
      <div className="panel mt-8 mb-8 rounded-2xl p-6 text-center">
        <p className="eyebrow text-center mb-4">Hospedagem de Infiltração</p>
        
        {!publicaUrl ? (
          <div>
            <p className="mono mb-5 text-[11px] uppercase tracking-widest text-[var(--ink-dim)]">
              Coloque essa landing no ar para enviar no e-mail ou direct.
            </p>
            <button onClick={publicar} disabled={ocupado === "publicar" || ocupado === "salvar"}
              className="btn-3d btn-3d-amber py-3 px-8 text-[11px] disabled:opacity-50 shadow-[0_0_20px_rgba(255,176,32,0.3)]">
              {ocupado === "publicar" ? "compilando build..." : "✦ PUBLICAR ONLINE"}
            </button>
          </div>
        ) : (
          <div>
            <p className="mono mb-3 text-[11px] uppercase tracking-widest text-[var(--signal)]">
              ✓ Landing online e pronta para interceptação
            </p>
            <div className="mx-auto flex max-w-sm flex-col gap-3 sm:flex-row">
              <a href={publicaUrl} target="_blank" rel="noreferrer"
                className="field-premium mono flex-1 truncate rounded-lg px-4 py-2.5 text-left text-xs text-white hover:text-[var(--signal)]">
                {publicaUrl}
              </a>
              <button onClick={copiar} className="btn-3d btn-3d-primary py-2 px-4 text-[10px]">
                {copiado ? "copiado" : "copiar"}
              </button>
            </div>
            <button onClick={despublicar} disabled={ocupado === "despublicar"}
              className="btn-3d btn-3d-ghost mt-6 py-2 px-6 text-[10px] disabled:opacity-50">
              {ocupado === "despublicar" ? "desativando..." : "derrubar página"}
            </button>
          </div>
        )}

        <div className="mt-8 border-t border-white/5 pt-6 text-left">
          <p className="eyebrow">Domínio próprio</p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--ink-dim)]">
            Quer um endereço tipo <span className="mono text-[var(--signal)]">barbearia-do-joao.com</span>?
            Compre um domínio, aponte para a Vercel e o site passa a responder nele — sem custo extra de hospedagem.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="https://www.hostinger.com.br/registro-de-dominios" target="_blank" rel="noopener"
              className="btn-3d btn-3d-ghost py-1.5 px-3 text-[9px] uppercase tracking-widest">Hostinger</a>
            <a href="https://www.namecheap.com/domains/" target="_blank" rel="noopener"
              className="btn-3d btn-3d-ghost py-1.5 px-3 text-[9px] uppercase tracking-widest">Namecheap</a>
            <a href="https://www.godaddy.com/pt-br/registro-de-dominio" target="_blank" rel="noopener"
              className="btn-3d btn-3d-ghost py-1.5 px-3 text-[9px] uppercase tracking-widest">GoDaddy</a>
            <a href="https://registro.br/" target="_blank" rel="noopener"
              className="btn-3d btn-3d-ghost py-1.5 px-3 text-[9px] uppercase tracking-widest">Registro.br (.br)</a>
          </div>
        </div>
      </div>
    </div>
  );
}
