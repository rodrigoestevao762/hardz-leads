import { NextResponse } from "next/server";
import { usuarioObrigatorio } from "@/lib/supabase-server";
import { enviarEmailDoLead } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { sb, user } = await usuarioObrigatorio();
    const { leadId, texto, assunto } = await req.json();
    if (!leadId || !texto) return NextResponse.json({ erro: "leadId e texto obrigatórios" }, { status: 400 });

    const { data: lead, error: e1 } = await sb
      .from("leads").select("*").eq("id", leadId).eq("user_id", user.id).single();
    if (e1 || !lead) return NextResponse.json({ erro: "lead não encontrado" }, { status: 404 });

    const { data: settings } = await sb.from("settings").select("negocio_nome").eq("user_id", user.id).single();
    const r = await enviarEmailDoLead(sb, user, lead, texto, assunto, settings?.negocio_nome || "HardZ Sites");
    if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: r.status });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "não autenticado") return NextResponse.json({ erro: msg }, { status: 401 });
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
