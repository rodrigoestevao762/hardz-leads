"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Settings = {
  negocio_nome: string; servico: string; diferenciais: string;
  remetente_email: string | null; resend_api_key: string | null;
};

export default function ConfigPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data } = await sb.from("settings").select("*").eq("user_id", user.id).single();
      setS(data || {
        negocio_nome: "HardZ Sites",
        servico: "Criação de sites profissionais",
        diferenciais: "Site próprio que aparece no Google, agendamento integrado, entrega rápida",
        remetente_email: null, resend_api_key: null,
      });
    })();
  }, []);

  async function salvar() {
    if (!s) return;
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    await sb.from("settings").upsert({ ...s, user_id: user.id });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  if (!s) return <p className="py-10 text-center text-slate-400">Carregando...</p>;

  const campo = "w-full rounded-lg border border-slate-600 bg-[#0b1020] px-3 py-2 text-sm outline-none focus:border-[#4f7cff]";

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-xl font-bold">Configurações</h1>
      <p className="mb-6 text-sm text-slate-400">Esses dados entram na personalização de cada mensagem gerada pela IA.</p>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Nome do seu negócio</label>
          <input className={campo} value={s.negocio_nome} onChange={(e) => setS({ ...s, negocio_nome: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Serviço oferecido</label>
          <input className={campo} value={s.servico} onChange={(e) => setS({ ...s, servico: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Diferenciais (a IA usa isso como argumento)</label>
          <textarea className={campo} rows={3} value={s.diferenciais} onChange={(e) => setS({ ...s, diferenciais: e.target.value })} />
        </div>
        <hr className="border-slate-700" />
        <div>
          <label className="mb-1 block text-sm font-medium">Resend — chave da API (para envio automático de e-mail)</label>
          <input className={campo} type="password" placeholder="re_..." value={s.resend_api_key || ""} onChange={(e) => setS({ ...s, resend_api_key: e.target.value })} />
          <p className="mt-1 text-xs text-slate-500">Grátis: 100 e-mails/dia. Pegue em resend.com/api-keys</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">E-mail remetente (do domínio verificado no Resend)</label>
          <input className={campo} type="email" placeholder="leads@seudominio.com" value={s.remetente_email || ""} onChange={(e) => setS({ ...s, remetente_email: e.target.value })} />
        </div>
        <button onClick={salvar} className="rounded-lg bg-[#4f7cff] px-5 py-2 font-semibold transition hover:bg-[#3d66e0]">
          {salvo ? "✓ Salvo!" : "Salvar"}
        </button>
      </div>
    </div>
  );
}
