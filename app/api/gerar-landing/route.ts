import { NextResponse } from "next/server";
import { usuarioObrigatorio } from "@/lib/supabase-server";
import { buildLandingHTML, textosPadrao, type TextosLanding } from "@/lib/landing";
import { idiomaDoPais } from "@/lib/mensagens";
import { CATEGORIAS } from "@/lib/categorias";

const MODELO = "gemini-3.6-flash";

export async function POST(req: Request) {
  try {
    const { sb, user } = await usuarioObrigatorio();
    const { leadId } = await req.json();
    if (!leadId) return NextResponse.json({ erro: "leadId obrigatório" }, { status: 400 });

    const { data: lead } = await sb
      .from("leads").select("*").eq("id", leadId).eq("user_id", user.id).single();
    if (!lead) return NextResponse.json({ erro: "lead não encontrado" }, { status: 404 });

    const apiKey = process.env.GEMINI_API_KEY;
    const dados = {
      nome: lead.nome,
      categoriaLabel: CATEGORIAS.find((c) => c.id === lead.categoria)?.label || lead.categoria,
      cidade: lead.cidade,
      telefone: lead.telefone,
      email: lead.email,
      instagram: lead.instagram,
      endereco: lead.endereco || null,
    };

    let textos: TextosLanding = textosPadrao(dados);

    if (apiKey) {
      const idioma = idiomaDoPais(lead.pais || "");
      const prompt = `Você escreve textos de landing page para pequenos negócios. Gere conteúdo para a landing page do negócio abaixo, ESCREVENDO TUDO EM ${idioma.toUpperCase()}.

Negócio: ${lead.nome}
Tipo: ${dados.categoriaLabel}
Cidade: ${lead.cidade}${lead.pais ? `, ${lead.pais}` : ""}

Devolva SOMENTE um JSON válido com estas chaves:
{
  "eyebrow": "etiqueta curta do topo (tipo + cidade, ex: BARBEARIA · LISBOA)",
  "h1a": "primeira parte do título principal (3-5 palavras, tom aspiracional)",
  "h1b": "segunda parte do título (2-3 palavras, a frase de impacto)",
  "sub": "parágrafo de apresentação (2 frases)",
  "servTitulo1": "palavra antes do destaque, ex: Nossos",
  "servTitulo2": "palavra em destaque, ex: serviços",
  "expTitulo1": "título da seção experiência, parte 1",
  "expTitulo2": "parte em destaque do título",
  "expTexto": "parágrafo sobre a experiência do cliente (2 frases)",
  "ctaEyebrow": "etiqueta da seção final (convite à ação, curto)",
  "ctaLinha1": "linha 1 do título final",
  "ctaLinha2": "linha 2 em destaque",
  "ctaSub": "frase final de convite (1-2 frases)",
  "rodape": "linha de créditos com © 2026 e o nome",
  "servicos": [4 objetos {"titulo","desc","preco"} — preços plausíveis na moeda local ou 'sob consulta'],
  "bullets": [3 objetos {"titulo","desc"} — diferenciais]
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.8 },
          }),
          signal: AbortSignal.timeout(45_000),
        }
      );
      if (res.ok) {
        const j = await res.json();
        const raw = j?.candidates?.[0]?.content?.parts?.[0]?.text;
        try {
          const parsed = JSON.parse(raw);
          textos = { ...textos, ...parsed };
          if (!Array.isArray(textos.servicos) || textos.servicos.length < 4) textos.servicos = textosPadrao(dados).servicos;
          if (!Array.isArray(textos.bullets) || textos.bullets.length < 3) textos.bullets = textosPadrao(dados).bullets;
        } catch { /* usa fallback */ }
      }
    }

    const { error } = await sb.from("landings").upsert(
      { user_id: user.id, lead_id: leadId, textos, accent: "#c9974c", tema: "escuro" },
      { onConflict: "user_id,lead_id" }
    );
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

    return NextResponse.json({ textos });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "não autenticado") return NextResponse.json({ erro: msg }, { status: 401 });
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
