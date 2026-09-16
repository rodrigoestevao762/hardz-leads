// Envio de e-mail via Resend — usado por /api/enviar-email e /api/enviar-automatico.
const LIMITE_POR_DIA = 80; // anti-spam: abaixo dos 100/dia do plano grátis do Resend

type LeadEmail = { id: string; nome: string; email: string | null };

export async function enviarEmailDoLead(
  sb: any,
  user: { id: string },
  lead: LeadEmail,
  texto: string,
  assunto?: string,
  negocioNome = "Prospectando AI"
): Promise<{ ok: true } | { ok: false; erro: string; status: number }> {
  if (!lead.email) return { ok: false, erro: "lead sem e-mail", status: 400 };

  const { data: settings } = await sb.from("settings").select("*").eq("user_id", user.id).single();
  const apiKey = settings?.resend_api_key || process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, erro: "Resend não configurado (settings ou RESEND_API_KEY)", status: 400 };
  const de = settings?.remetente_email || process.env.RESEND_FROM || "onboarding@resend.dev";

  // limite diário por usuário
  const desde = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await sb.from("messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id).eq("canal", "email").eq("status", "enviada").gte("criado_em", desde);
  if ((count || 0) >= LIMITE_POR_DIA) {
    return { ok: false, erro: `Limite diário de ${LIMITE_POR_DIA} e-mails atingido`, status: 429 };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: de,
      to: [lead.email],
      subject: assunto || `${negocioNome} — site profissional para ${lead.nome}`,
      text: texto,
    }),
  });
  const json = await res.json();

  if (!res.ok) {
    await sb.from("messages").insert({ user_id: user.id, lead_id: lead.id, canal: "email", texto, status: "erro", erro: json?.message || `HTTP ${res.status}` });
    return { ok: false, erro: json?.message || `Resend ${res.status}`, status: 502 };
  }

  await sb.from("messages").insert({ user_id: user.id, lead_id: lead.id, canal: "email", texto, status: "enviada" });
  await sb.from("leads").update({ status: "enviado", canal: "email", atualizado_em: new Date().toISOString() }).eq("id", lead.id);
  return { ok: true };
}
