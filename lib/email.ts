import nodemailer from "nodemailer";

const LIMITE_POR_DIA = 450;

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

  const l = lead.email.toLowerCase().trim();
  const parts = l.split('@');
  if (parts.length !== 2) return { ok: false, erro: "e-mail em formato inválido", status: 400 };
  const userPart = parts[0];
  const domainPart = parts[1];

  const extensoesInvalidas = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js", ".ttf", ".woff"];
  const dominiosBloqueados = [
    "duckduckgo", "sentry", "example", "w3.org", "sijax", "bing.com", "yahoo.com",
    "google.com", "microsoft.com", "facebook.com", "instagram.com", "twitter.com",
    "apple.com", "cloudflare.com", "ifood.com", "tripadvisor.com", "tiktok.com",
    "linkedin.com", "amazon.com", "qwant.com", "email.com", "teste.com", "test.com",
    "site.com", "suaempresa.com", "dominio.com", "domain.com", "yourdomain.com", "wixsite.com"
  ];
  const usernamesBloqueados = [
    "seuemail", "seunome", "email", "teste", "test", "noreply", "no-reply", "naoresponda", 
    "donotreply", "1234", "admin@site", "contato@site", "contato@suaempresa", "nome@site"
  ];

  if (
    extensoesInvalidas.some(ext => l.endsWith(ext)) ||
    dominiosBloqueados.some(d => domainPart.includes(d)) ||
    l.length > 50 || l.length < 5 ||
    l.includes('+or+') || userPart === '22' ||
    l.startsWith('-') || l.startsWith('.') ||
    usernamesBloqueados.some(u => userPart === u || userPart.includes(u)) ||
    !domainPart.includes('.') || domainPart.split('.').some(p => p.length === 0)
  ) {
    // Retornamos ok: true mas marcamos como erro no status, ou ok: false. 
    // Se retornarmos erro aqui, não gastamos a cota e avisamos a UI.
    return { ok: false, erro: "E-mail bloqueado por conter formato inválido ou ser reconhecido como falso (Anti-Bounce)", status: 400 };
  }

  const { data: settings } = await sb.from("settings").select("*").eq("user_id", user.id).single();
  const gmailPassword = settings?.resend_api_key || process.env.GMAIL_APP_PASSWORD; // Usando a mesma coluna no banco
  const gmailEmail = settings?.remetente_email || process.env.GMAIL_EMAIL;

  if (!gmailPassword || !gmailEmail) {
    return { ok: false, erro: "E-mail ou Senha de App do Gmail não configurados nas configurações", status: 400 };
  }

  // limite diário por usuário
  const desde = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await sb.from("messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id).eq("canal", "email").eq("status", "enviada").gte("criado_em", desde);
  if ((count || 0) >= LIMITE_POR_DIA) {
    return { ok: false, erro: `Limite diário de ${LIMITE_POR_DIA} e-mails atingido (Anti-Spam)`, status: 429 };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailEmail,
      pass: gmailPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${negocioNome}" <${gmailEmail}>`,
      to: lead.email,
      subject: assunto || `${negocioNome} — contato profissional para ${lead.nome}`,
      text: texto,
    });
    
    await sb.from("messages").insert({ user_id: user.id, lead_id: lead.id, canal: "email", texto, status: "enviada" });
    await sb.from("leads").update({ status: "enviado", canal: "email", atualizado_em: new Date().toISOString() }).eq("id", lead.id);
    return { ok: true };
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    await sb.from("messages").insert({ user_id: user.id, lead_id: lead.id, canal: "email", texto, status: "erro", erro: error.message || "Erro SMTP" });
    return { ok: false, erro: error.message || "Falha no provedor de e-mail (Gmail)", status: 502 };
  }
}
