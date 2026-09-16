import { NextResponse } from "next/server";
import { buscarDuckDuckGo } from "@/lib/enrichment";

export async function POST(req: Request) {
  try {
    const { nome, cidade, pais } = await req.json();

    if (!nome || !cidade) {
      return NextResponse.json({ error: "Nome e cidade são obrigatórios" }, { status: 400 });
    }

    // Apenas busca as redes sem salvar no banco
    const enrichment = await buscarDuckDuckGo(nome, cidade, pais);

    return NextResponse.json({
      success: true,
      data: enrichment
    });
  } catch (error: any) {
    console.error("Erro no enrich search:", error);
    return NextResponse.json({ error: error.message || "Erro no servidor" }, { status: 500 });
  }
}
