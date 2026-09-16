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

  if (!s) return (
    <p className="mono py-16 text-center text-xs uppercase tracking-widest text-[var(--ink-faint)]">
      <span className="pulse-dot mr-2 inline-block align-middle" /> carregando...
    </p>
  );

  const campo = "field mono w-full rounded-xl px-3.5 py-2.5 text-sm";

  return (
    <div className="max-w-xl">
      <p className="eyebrow">Identidade da operação</p>
      <h1 className="headline mt-2 text-2xl font-bold">Configurações</h1>
      <p className="mono mt-2 text-[11px] leading-relaxed uppercase tracking-widest text-[var(--ink-faint)]">
        esses dados entram na personalização de cada mensagem gerada pela IA
      </p>

      <div className="panel mt-7 space-y-5 rounded-2xl p-6">
        <div>
          <label className="mono mb-1.5 block text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">Nome do seu negócio</label>
          <input className={campo} value={s.negocio_nome} onChange={(e) => setS({ ...s, negocio_nome: e.target.value })} />
        </div>
        <div>
          <label className="mono mb-1.5 block text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">Serviço oferecido</label>
          <input className={campo} value={s.servico} onChange={(e) => setS({ ...s, servico: e.target.value })} />
        </div>
        <div>
          <label className="mono mb-1.5 block text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">Diferenciais (a IA usa isso como argumento)</label>
          <textarea className={campo} rows={3} value={s.diferenciais} onChange={(e) => setS({ ...s, diferenciais: e.target.value })} />
        </div>
        <div className="glow-line" />
        <div>
          <label className="mono mb-1.5 block text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">Resend — chave da API (envio automático)</label>
          <input className={campo} type="password" placeholder="re_..." value={s.resend_api_key || ""} onChange={(e) => setS({ ...s, resend_api_key: e.target.value })} />
          <p className="mono mt-1.5 text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">grátis: 100 e-mails/dia · resend.com/api-keys</p>
        </div>
        <div>
          <label className="mono mb-1.5 block text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">E-mail remetente (domínio verificado no Resend)</label>
          <input className={campo} type="email" placeholder="leads@seudominio.com" value={s.remetente_email || ""} onChange={(e) => setS({ ...s, remetente_email: e.target.value })} />
        </div>
        <button onClick={salvar} className="btn-signal mono rounded-xl px-6 py-2.5 text-[11px] uppercase tracking-widest">
          {salvo ? "✓ transmitido" : "salvar"}
        </button>
      </div>
    </div>
  );
}
