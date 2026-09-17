"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { motion } from "framer-motion";

type Settings = {
  negocio_nome: string; servico: string; diferenciais: string;
  remetente_email: string | null; resend_api_key: string | null;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
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
      <span className="pulse-dot mr-2 inline-block align-middle" /> carregando núcleo...
    </p>
  );

  const campo = "field-premium mono w-full rounded-xl px-3.5 py-2.5 text-sm";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto">
      <div className="mb-6">
        <p className="eyebrow">Identidade da operação</p>
        <h1 className="headline mt-2 text-2xl font-bold">Configurações Base</h1>
        <p className="mono mt-2 text-[11px] leading-relaxed uppercase tracking-widest text-[var(--ink-faint)]">
          esses dados moldam as mensagens geradas pelas IAs nos disparos
        </p>
      </div>

      <motion.div 
        variants={containerVariants} initial="hidden" animate="show"
        className="panel mt-7 space-y-6 rounded-3xl p-6 md:p-8 bg-black/40 backdrop-blur-xl border border-white/5 shadow-[0_0_40px_rgba(45,255,180,0.03)]"
      >
        <motion.div variants={itemVariants}>
          <label className="mono mb-2 block text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">Nome da Operação (Seu Negócio)</label>
          <input className={campo} value={s.negocio_nome} onChange={(e) => setS({ ...s, negocio_nome: e.target.value })} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <label className="mono mb-2 block text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">Produto / Serviço Oferecido</label>
          <input className={campo} value={s.servico} onChange={(e) => setS({ ...s, servico: e.target.value })} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <label className="mono mb-2 block text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">Diferenciais Estratégicos (Persuasão da IA)</label>
          <textarea className={campo} rows={3} value={s.diferenciais} onChange={(e) => setS({ ...s, diferenciais: e.target.value })} />
        </motion.div>
        
        <motion.div variants={itemVariants} className="glow-line my-6" />
        
        <motion.div variants={itemVariants}>
          <label className="mono mb-2 block text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">E-mail Remetente (Gmail)</label>
          <input className={campo} type="email" placeholder="hardzsites@gmail.com" value={s.remetente_email || ""} onChange={(e) => setS({ ...s, remetente_email: e.target.value })} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <label className="mono mb-2 block text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">App Password (Senha de Aplicativo)</label>
          <input className={campo} type="password" placeholder="abcd efgh ijkl mnop" value={s.resend_api_key || ""} onChange={(e) => setS({ ...s, resend_api_key: e.target.value })} />
          
          <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4 text-xs text-[var(--ink-dim)]">
            <p className="font-semibold text-[var(--signal)] mb-2 flex items-center gap-2">
              <span className="pulse-dot bg-[var(--signal)]" /> Setup Bypass (Google Auth):
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-1 opacity-80 mono text-[10px] leading-relaxed">
              <li>Acesse <a href="https://myaccount.google.com/security" target="_blank" className="text-[var(--signal)] hover:underline">Google Security</a>.</li>
              <li>Garanta que a <strong>2FA (Verificação 2 etapas)</strong> está ATIVA.</li>
              <li>Busque <strong>"Senhas de app"</strong> no topo da página.</li>
              <li>Crie a key com o nome "ProspectandoAI".</li>
              <li>Cole a hash de 16 caracteres acima (não use sua senha real).</li>
            </ol>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="pt-2">
          <button 
            onClick={salvar} 
            className={`w-full py-3 text-[11px] transition-all ${salvo ? "btn-3d btn-3d-ghost" : "btn-3d btn-3d-primary shadow-[0_0_20px_rgba(45,255,180,0.2)]"}`}
          >
            {salvo ? "✓ DADOS SINCRONIZADOS" : "ATUALIZAR NÚCLEO"}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
