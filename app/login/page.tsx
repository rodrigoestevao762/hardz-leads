"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

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
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700/60 bg-[#111831] p-8">
        <h1 className="mb-1 text-2xl font-bold">HardZ <span className="text-[#4f7cff]">Leads</span></h1>
        <p className="mb-6 text-sm text-slate-400">
          {modo === "login" ? "Acesse seu painel" : "Crie sua conta gratuita"}
        </p>
        <form onSubmit={entrar} className="space-y-4">
          <input
            type="email" required placeholder="E-mail" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-[#0b1020] px-4 py-2.5 text-sm outline-none focus:border-[#4f7cff]"
          />
          <input
            type="password" required minLength={6} placeholder="Senha (mín. 6 caracteres)" value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-[#0b1020] px-4 py-2.5 text-sm outline-none focus:border-[#4f7cff]"
          />
          <button
            type="submit" disabled={carregando}
            className="w-full rounded-lg bg-[#4f7cff] py-2.5 font-semibold text-white transition hover:bg-[#3d66e0] disabled:opacity-50"
          >
            {carregando ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
        <button
          onClick={google}
          className="mt-3 w-full rounded-lg border border-slate-600 py-2.5 text-sm font-medium transition hover:bg-slate-700/40"
        >
          Continuar com Google
        </button>
        <p className="mt-4 text-center text-sm text-slate-400">
          {modo === "login" ? "Não tem conta? " : "Já tem conta? "}
          <button className="text-[#4f7cff] hover:underline" onClick={() => { setModo(modo === "login" ? "cadastro" : "login"); setErro(null); setMsg(null); }}>
            {modo === "login" ? "Cadastre-se" : "Entrar"}
          </button>
        </p>
        {erro && <p className="mt-3 text-sm text-red-400">{erro}</p>}
        {msg && <p className="mt-3 text-sm text-emerald-400">{msg}</p>}
      </div>
    </main>
  );
}
