import { NextResponse } from "next/server";
import { usuarioObrigatorio } from "@/lib/supabase-server";
import { geocodificar, buscarEmpresas } from "@/lib/overpass";
import { CATEGORIAS, getCategoria } from "@/lib/categorias";
import { qualificar } from "@/lib/qualificacao";

const UA = { "User-Agent": "ProspectandoAI/1.0 (prospeccao de empresas)" };

// Busca de empresas no mapa: por cidade (texto) ou por clique (lat/lng).
export async function POST(req: Request) {
  try {
    await usuarioObrigatorio();
    const { lat, lng, cidade, categoriaId } = await req.json();

    let ponto: { lat: number; lng: number; radiusM: number; paisNome: string } | null = null;
    let cidadeNome = cidade || "";
    let paisNome = "";

    if (cidade && (lat == null || lng == null)) {
      ponto = await geocodificar(cidade);
      if (!ponto) return NextResponse.json({ erro: "cidade não encontrada" }, { status: 404 });
      paisNome = ponto.paisNome;
    } else if (lat != null && lng != null) {
      // clique no mapa: descobre a cidade via geocodificação reversa
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14&addressdetails=1`,
        { headers: UA }
      );
      if (res.ok) {
        const a = (await res.json())?.address || {};
        cidadeNome = a.city || a.town || a.village || a.municipality || a.suburb || a.county || "Região";
        paisNome = a.country || "";
      } else {
        cidadeNome = "Região";
      }
      ponto = { lat, lng, radiusM: 12000, paisNome };
    } else {
      return NextResponse.json({ erro: "informe cidade ou lat/lng" }, { status: 400 });
    }

    const cat = getCategoria(categoriaId);
    
    let emp: any[] = [];
    
    // O mapa AGORA USA ESTRITAMENTE O OVERPASS PARA VELOCIDADE EXTREMA (VOANDO).
    // O Outscraper será usado EXCLUSIVAMENTE para enriquecer e-mails/dados após o lead ser capturado.
    const tags = cat
      ? cat.tags
      : Array.from(new Set(CATEGORIAS.flatMap((c) => c.tags)));

    // no modo "all", cada elemento recebe a categoria da sua tag OSM
    const mapaTag = new Map<string, string>();
    for (const c of CATEGORIAS) {
      for (const t of c.tags) {
        const [k, v] = t.split("=");
        if (!mapaTag.has(`${k}=${v}`)) mapaTag.set(`${k}=${v}`, c.id);
      }
    }
    const classificar = cat
      ? undefined
      : (t: Record<string, string>) => {
          for (const [chave, id] of mapaTag) {
            const [k, v] = chave.split("=");
            const valor = t[k];
            if (!valor) continue;
            if (v.includes("~")) {
              const re = new RegExp(v.replace(/~/g, ""), "i");
              if (re.test(valor)) return id;
            } else if (valor.toLowerCase() === v.toLowerCase()) {
              return id;
            }
          }
          return "outro";
        };

    emp = await buscarEmpresas(
      cat?.id || "all",
      tags,
      ponto.lat,
      ponto.lng,
      ponto.radiusM,
      cidadeNome,
      paisNome,
      classificar
    );

    const resultados = emp
      .map((e) => ({
        ...e,
        ...qualificar({ website: e.website, instagram: e.instagram, email: e.email, telefone: e.telefone, endereco: e.endereco }),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 150);

    return NextResponse.json({
      lat: ponto.lat, lng: ponto.lng, cidade: cidadeNome, pais: paisNome, resultados,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "não autenticado") return NextResponse.json({ erro: msg }, { status: 401 });
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
