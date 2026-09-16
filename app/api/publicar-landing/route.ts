import { NextResponse } from "next/server";
import { usuarioObrigatorio } from "@/lib/supabase-server";

function slugify(s: string): string {
  const base = (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "landing";
}

export async function POST(req: Request) {
  try {
    const { sb, user } = await usuarioObrigatorio();
    const { leadId, publicar } = await req.json();
    if (!leadId) return NextResponse.json({ erro: "leadId obrigatório" }, { status: 400 });

    const { data: landing } = await sb
      .from("landings")
      .select("id, slug, publicada")
      .eq("user_id", user.id)
      .eq("lead_id", leadId)
      .single();
    if (!landing)
      return NextResponse.json({ erro: "gere e salve a landing antes de publicar" }, { status: 404 });

    // despublicar
    if (publicar === false) {
      const { error } = await sb.from("landings").update({ publicada: false }).eq("id", landing.id);
      if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, publicada: false });
    }

    // publicar: snapshot dos dados do lead + slug único
    const { data: lead } = await sb
      .from("leads")
      .select("nome, categoria, cidade, telefone, email, instagram, endereco")
      .eq("id", leadId)
      .single();
    if (!lead) return NextResponse.json({ erro: "lead não encontrado" }, { status: 404 });

    const baseSlug = landing.slug || slugify(lead.nome);
    let slug = baseSlug;
    for (let i = 0; i < 5; i++) {
      const { data: conflito } = await sb
        .from("landings")
        .select("id")
        .eq("slug", slug)
        .neq("id", landing.id)
        .maybeSingle();
      if (!conflito) break;
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const { error } = await sb
      .from("landings")
      .update({ slug, publicada: true, dados: lead })
      .eq("id", landing.id);
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

    const site = process.env.NEXT_PUBLIC_SITE_URL || "https://prospectandoai.vercel.app";
    return NextResponse.json({ ok: true, publicada: true, slug, url: `${site}/s/${slug}` });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "não autenticado") return NextResponse.json({ erro: msg }, { status: 401 });
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
