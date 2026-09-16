import { NextResponse } from "next/server";
import { usuarioObrigatorio } from "@/lib/supabase-server";
import { radarFoods } from "@/lib/enrichment";

export async function POST(req: Request) {
  try {
    await usuarioObrigatorio();
    const { nicho, cidade } = await req.json();

    if (!nicho && !cidade) {
      return NextResponse.json({ erro: "Informe pelo menos um nicho ou cidade" }, { status: 400 });
    }

    const perfis = await radarFoods(nicho || "", cidade || "");

    return NextResponse.json({
      resultados: perfis,
      total: perfis.length
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "não autenticado") return NextResponse.json({ erro: msg }, { status: 401 });
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
