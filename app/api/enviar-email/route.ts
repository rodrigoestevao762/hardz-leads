import { NextResponse } from "next/server";
import { usuarioObrigatorio } from "@/lib/supabase-server";

const LIMITE_POR_DIA = 80; // anti-spam: abaixo dos 100/dia do plano grátis do Resend

export async function POST(req: Request) {
  try {
    const { sb, user } = await usuarioObrigatorio();
    const { leadId, texto, assunto } = await req.json();
    if (!leadId || !texto) return NextResponse.json({ erro: "leadId e texto obrigatórios" }, { status: 400 });

    const { data: lead, error: e1 } = await sb
      .from("leads").select("*").eq("id", leadId).eq("user_id", user.id).single();
    if (e1 || !lead) return NextResponse.json({ erro: "lead não encontrado" }, { status: 404 });
    if (!lead.email) return NextResponse.json({ erro: "lead sem e-mail" }, { status: 400 });

    const { data: settings } = await sb.from("settings").select("*").eq("user_id", user.id).single();
    const apiKey = settings?.resend_api_key || process.env.RESEND_API_KEY;
    if (!apiKey) return NextResponse.json({ erro: "Resend não configurado (settings ou RESEND_API_KEY)" }, { status: 400 });
    const de = settings?.remetente_email || process.env.RESEND_FROM || "onboarding@resend.dev";

    // limite diário por usuário
    const desde = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count } = await sb.from("messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id).eq("canal", "email").eq("status", "enviada").gte("criado_em", desde);
    if ((count || 0) >= LIMITE_POR_DIA) {
      return NextResponse.json({ erro: `Limite diário de ${LIMITE_POR_DIA} e-mails atingido` }, { status: 429 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: de,
        to: [lead.email],
        subject: assunto || `${settings?.negocio_nome || "HardZ Sites"} — site profissional para ${lead.nome}`,
        text: texto,
      }),
    });
    const json = await res.json();

    if (!res.ok) {
      await sb.from("messages").insert({ user_id: user.id, lead_id: lead.id, canal: "email", texto, status: "erro", erro: json?.message || `HTTP ${res.status}` });
      return NextResponse.json({ erro: json?.message || `Resend ${res.status}` }, { status: 502 });
    }

    await sb.from("messages").insert({ user_id: user.id, lead_id: lead.id, canal: "email", texto, status: "enviada" });
    await sb.from("leads").update({ status: "enviado", canal: "email", atualizado_em: new Date().toISOString() }).eq("id", lead.id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "não autenticado") return NextResponse.json({ erro: msg }, { status: 401 });
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
