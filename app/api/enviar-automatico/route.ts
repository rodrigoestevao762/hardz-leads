import { NextResponse } from "next/server";
import { usuarioObrigatorio } from "@/lib/supabase-server";
import { gerarMensagem } from "@/lib/mensagens";
import { enviarEmailDoLead } from "@/lib/email";

// Envio em um clique: gera a mensagem (se ainda não houver) e envia o e-mail.
export async function POST(req: Request) {
  try {
    const { sb, user } = await usuarioObrigatorio();
    const { leadId } = await req.json();
    if (!leadId) return NextResponse.json({ erro: "leadId obrigatório" }, { status: 400 });

    const { data: lead, error: e1 } = await sb
      .from("leads").select("*").eq("id", leadId).eq("user_id", user.id).single();
    if (e1 || !lead) return NextResponse.json({ erro: "lead não encontrado" }, { status: 404 });
    if (!lead.email) return NextResponse.json({ erro: "lead sem e-mail" }, { status: 400 });

    // reutiliza a última mensagem gerada, se existir; senão gera agora
    const { data: ultima } = await sb
      .from("messages").select("texto, status")
      .eq("lead_id", leadId).order("criado_em", { ascending: false }).limit(1).maybeSingle();

    let texto = ultima?.texto || "";
    let fonte = "existente";
    if (!texto) {
      const { data: settings } = await sb
        .from("settings").select("negocio_nome, servico, diferenciais").eq("user_id", user.id).single();
      const negocio = settings || { negocio_nome: "Prospectando AI", servico: "Criação de sites profissionais", diferenciais: "Site próprio que aparece no Google, entrega rápida" };
      const g = await gerarMensagem(
        {
          nome: lead.nome, categoria: lead.categoria, cidade: lead.cidade, pais: lead.pais,
          temSite: Boolean(lead.website), temInstagram: Boolean(lead.instagram), temEmail: Boolean(lead.email),
          negocio,
        },
        process.env.GEMINI_API_KEY || null
      );
      texto = g.texto;
      fonte = g.fonte;
      await sb.from("messages").insert({ user_id: user.id, lead_id: lead.id, canal: "email", texto, status: "gerada" });
    }

    const { data: settings } = await sb.from("settings").select("negocio_nome").eq("user_id", user.id).single();
    const r = await enviarEmailDoLead(sb, user, lead, texto, undefined, settings?.negocio_nome || "Prospectando AI");
    if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: r.status });
    return NextResponse.json({ ok: true, texto, fonte });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "não autenticado") return NextResponse.json({ erro: msg }, { status: 401 });
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
