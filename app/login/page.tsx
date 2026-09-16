"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

function MiniRadar() {
  return (
    <div className="radar aspect-square w-full max-w-sm">
      <div className="radar-sweep" />
      <span className="blip" style={{ left: "30%", top: "30%", animationDelay: "0.5s" }} />
      <span className="blip amber" style={{ left: "66%", top: "55%", animationDelay: "1.8s" }} />
      <span className="blip" style={{ left: "48%", top: "70%", animationDelay: "3s" }} />
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null); setMsg(null); setCarregando(true);
    const sb = supabaseBrowser();
    if (modo === "login") {
      const { error } = await sb.auth.signInWithPassword({ email, password: senha });
      if (error) setErro(error.message);
      else window.location.href = "/app";
    } else {
      const { error } = await sb.auth.signUp({ email, password: senha });
      if (error) setErro(error.message);
      else setMsg("Conta criada! Confirme o e-mail (se exigido) e faça login.");
    }
    setCarregando(false);
  }

  async function google() {
    setErro(null);
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErro(error.message);
  }

  return (
    <main className="bg-void grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      {/* Painel esquerdo — atmosfera */}
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-[var(--line)] p-12 lg:flex">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <Link href="/" className="mono relative flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[var(--ink-dim)] transition hover:text-[var(--signal)]">
          ← voltar ao site
        </Link>
        <div className="relative flex flex-1 items-center justify-center py-12">
          <div className="float-slow">
            <MiniRadar />
          </div>
        </div>
        <div className="relative">
          <p className="eyebrow reveal">Sala de controle</p>
          <h2 className="headline reveal d1 mt-4 max-w-md text-3xl font-bold leading-tight">
            Todo dia, milhares de negócios entram no ar <span className="text-signal-glow">sem um site.</span>
          </h2>
          <p className="reveal d2 mono mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
            <span>· openstreetmap ao vivo</span>
            <span>· score automático</span>
            <span>· IA multilíngue</span>
          </p>
        </div>
      </section>

      {/* Formulário */}
      <section className="relative flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="radar h-10 w-10"><div className="radar-sweep" /></div>
            <Link href="/" className="headline text-sm font-bold uppercase tracking-widest">
              Prospectando<span className="text-signal-glow">AI</span>
            </Link>
          </div>
          <p className="eyebrow">{modo === "login" ? "Acesso" : "Novo operador"}</p>
          <h1 className="headline mt-3 text-2xl font-bold">
            {modo === "login" ? "Bem-vindo de volta." : "Crie sua conta gratuita."}
          </h1>
          <p className="mono mt-2 text-[11px] uppercase tracking-widest text-[var(--ink-faint)]">
            {modo === "login" ? "identifique-se para abrir o radar" : "sem cartão · comece em minutos"}
          </p>

          <form onSubmit={entrar} className="mt-8 space-y-4">
            <input
              type="email" required placeholder="E-mail" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field w-full rounded-xl px-4 py-3 text-sm"
            />
            <input
              type="password" required minLength={6} placeholder="Senha (mín. 6 caracteres)" value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="field w-full rounded-xl px-4 py-3 text-sm"
            />
            <button
              type="submit" disabled={carregando}
              className="btn-signal w-full rounded-xl py-3.5 text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {carregando ? "Conectando..." : modo === "login" ? "Entrar no radar" : "Criar conta"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <div className="glow-line flex-1" />
            <span className="mono text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">ou</span>
            <div className="glow-line flex-1" />
          </div>

          <button
            onClick={google}
            className="btn-ghost mono w-full rounded-xl py-3.5 text-xs uppercase tracking-widest"
          >
            Continuar com Google
          </button>

          <p className="mt-7 text-center text-sm text-[var(--ink-dim)]">
            {modo === "login" ? "Ainda não opera o radar? " : "Já tem conta? "}
            <button
              className="text-[var(--signal)] transition hover:underline"
              onClick={() => { setModo(modo === "login" ? "cadastro" : "login"); setErro(null); setMsg(null); }}
            >
              {modo === "login" ? "Cadastre-se" : "Entrar"}
            </button>
          </p>

          {erro && (
            <p className="mono mt-4 rounded-lg border border-[var(--alert)]/40 bg-[var(--alert)]/10 px-3 py-2 text-xs text-[var(--alert)]">
              {erro}
            </p>
          )}
          {msg && (
            <p className="mono mt-4 rounded-lg border border-[var(--signal)]/40 bg-[var(--signal)]/10 px-3 py-2 text-xs text-[var(--signal)]">
              {msg}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
