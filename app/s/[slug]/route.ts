import { supabaseServer } from "@/lib/supabase-server";
import { buildLandingHTML, type DadosLanding, type TextosLanding } from "@/lib/landing";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data } = await sb
    .from("landings")
    .select("textos, accent, tema, dados")
    .eq("slug", slug)
    .eq("publicada", true)
    .maybeSingle();

  if (!data || !data.textos || Object.keys(data.textos).length === 0) {
    return new Response(
      `<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"><title>Página não encontrada</title>
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#12100d;color:#f2ead9}
a{color:#2dffb4}</style></head>
<body><div style="text-align:center"><h1>Página não encontrada</h1><p>Este site não existe ou foi despublicado.</p></div></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const d = (data.dados || {}) as Record<string, unknown>;
  const dados: DadosLanding = {
    nome: (d.nome as string) || "Negócio",
    categoriaLabel: (d.categoriaLabel as string) || (d.categoria as string) || "negócio local",
    cidade: (d.cidade as string) || "",
    telefone: (d.telefone as string | null) ?? null,
    email: (d.email as string | null) ?? null,
    instagram: (d.instagram as string | null) ?? null,
    endereco: (d.endereco as string | null) ?? null,
  };

  const html = buildLandingHTML(
    dados,
    data.textos as TextosLanding,
    data.accent || "#c9974c",
    data.tema === "claro" ? "claro" : "escuro"
  );

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
