import { NextResponse } from "next/server";
import { usuarioObrigatorio } from "@/lib/supabase-server";
import { gerarMensagem } from "@/lib/mensagens";

export async function POST(req: Request) {
  try {
    const { sb, user } = await usuarioObrigatorio();
    const { leadId } = await req.json();

    const { data: lead, error: e1 } = await sb
      .from("leads").select("*").eq("id", leadId).eq("user_id", user.id).single();
    if (e1 || !lead) return NextResponse.json({ erro: "lead não encontrado" }, { status: 404 });

    const { data: settings } = await sb
      .from("settings").select("negocio_nome, servico, diferenciais").eq("user_id", user.id).single();

    const negocio = settings || { negocio_nome: "Prospectando AI", servico: "Criação de sites profissionais", diferenciais: "Site próprio que aparece no Google, entrega rápida" };

    const { texto, fonte } = await gerarMensagem(
      {
        nome: lead.nome,
        categoria: lead.categoria,
        cidade: lead.cidade,
        pais: lead.pais,
        temSite: Boolean(lead.website),
        temInstagram: Boolean(lead.instagram),
        temEmail: Boolean(lead.email),
        negocio,
      },
      process.env.GEMINI_API_KEY || null
    );

    await sb.from("messages").insert({
      user_id: user.id, lead_id: lead.id, canal: lead.email ? "email" : "dm", texto, status: "gerada",
    });
    if (lead.status === "novo") {
      await sb.from("leads").update({ status: "mensagem_gerada", atualizado_em: new Date().toISOString() }).eq("id", lead.id);
    }
    return NextResponse.json({ texto, fonte });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "não autenticado") return NextResponse.json({ erro: msg }, { status: 401 });
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
