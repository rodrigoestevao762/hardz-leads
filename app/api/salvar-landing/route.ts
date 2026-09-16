import { NextResponse } from "next/server";
import { usuarioObrigatorio } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { sb, user } = await usuarioObrigatorio();
    const { leadId, textos, accent, tema } = await req.json();
    if (!leadId || !textos) return NextResponse.json({ erro: "leadId e textos obrigatórios" }, { status: 400 });

    const { error } = await sb.from("landings").upsert(
      {
        user_id: user.id,
        lead_id: leadId,
        textos,
        accent: accent || "#c9974c",
        tema: tema === "claro" ? "claro" : "escuro",
      },
      { onConflict: "user_id,lead_id" }
    );
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "não autenticado") return NextResponse.json({ erro: msg }, { status: 401 });
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
