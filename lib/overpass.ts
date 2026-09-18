// Busca de empresas via Overpass API (OpenStreetMap) — gratuita, sem chave.
// Docs: https://overpass-api.de/ — respeitar limites de uso (1 req/s).

// Endpoints públicos do Overpass — o principal fica sobrecarregado às vezes (504),
// então tentamos os espelhos em sequência.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

export type EmpresaOSM = {
  osmId: string;
  nome: string;
  categoria: string; // id da categoria
  cidade: string;
  pais: string;
  lat: number;
  lng: number;
  telefone: string | null;
  website: string | null;
  instagram: string | null;
  email: string | null;
  endereco: string;
};

function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Geocodifica cidade/país via Nominatim (grátis). */
export async function geocodificar(cidade: string, pais?: string): Promise<{ lat: number; lng: number; radiusM: number; paisNome: string } | null> {
  const q = pais ? `${cidade}, ${pais}` : cidade;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "ProspectandoAI/1.0 (prospeccao)" } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.length) return null;
  const d = data[0];
  const bbox = String(d.boundingbox || "").split(",");
  // boundingbox: [sul, norte, oeste, leste]
  let radiusM = 15000;
  if (bbox.length === 4) {
    const dLat = Math.abs(parseFloat(bbox[1]) - parseFloat(bbox[0])) * 111000;
    const dLng = Math.abs(parseFloat(bbox[3]) - parseFloat(bbox[2])) * 111000;
    radiusM = Math.min(45000, Math.max(3000, Math.round(Math.max(dLat, dLng) / 2)));
  }
  return { lat: parseFloat(d.lat), lng: parseFloat(d.lon), radiusM, paisNome: d.display_name?.split(",").pop()?.trim() || pais || "" };
}

/** Busca empresas por tags num raio ao redor do ponto.
 *  `classificar` (opcional): recebe as tags OSM do elemento e devolve o id da categoria —
 *  usado no mapa, onde a busca junta tags de todas as categorias. */
export async function buscarEmpresas(
  categoriaId: string,
  tags: string[],
  lat: number,
  lng: number,
  radiusM: number,
  cidade: string,
  pais: string,
  classificar?: (t: Record<string, string>) => string
): Promise<EmpresaOSM[]> {
  const around = radiusM > 0 ? `(around:${radiusM},${lat},${lng})` : "";
  const selectors = tags.map((t) => {
    if (t.includes("~")) {
      const [k, v] = t.split("~");
      return `nwr["${k}"~"${esc(v)}",i]${around};`;
    }
    const [k, v] = t.split("=");
    return `nwr["${k}"="${esc(v)}"]${around};`;
  });
  // Limite massivo de 15000 resultados para velocidade e volume de extração extremo
  const query = `[out:json][timeout:60];(${selectors.join("")});out center 15000;`;

  const UA = { "User-Agent": "ProspectandoAI/1.0 (prospeccao de empresas)" };

  // Tenta cada endpoint; em caso de erro de rede ou 5xx/429 passa para o próximo.
  let json: { elements?: any[] } | null = null;
  let ultimoErro: Error | null = null;
  for (const url of OVERPASS_ENDPOINTS) {
    for (let tentativa = 0; tentativa < 2; tentativa++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", ...UA },
          body: "data=" + encodeURIComponent(query),
          signal: AbortSignal.timeout(90_000),
        });
        if (res.ok) {
          json = await res.json();
          break;
        }
        ultimoErro = new Error(`Overpass ${res.status}`);
        if (res.status === 400) throw ultimoErro; // query inválida: não adianta repetir
      } catch (e) {
        ultimoErro = e instanceof Error ? e : new Error(String(e));
        if (ultimoErro.message.startsWith("Overpass 400")) throw ultimoErro;
      }
      // pequena pausa antes de repetir o mesmo endpoint
      await new Promise((r) => setTimeout(r, 1500));
    }
    if (json) break;
  }
  if (!json) throw ultimoErro || new Error("Overpass indisponível");

  const seen = new Set<string>();
  const out: EmpresaOSM[] = [];
  for (const el of json.elements || []) {
    const t = el.tags || {};
    if (!t.name) continue;
    const osmId = `${el.type}/${el.id}`;
    if (seen.has(osmId)) continue;
    seen.add(osmId);
    const clat = el.lat ?? el.center?.lat;
    const clng = el.lon ?? el.center?.lon;
    if (clat == null || clng == null) continue;
    // filtra duplicados pelo nome+rua
    const key = (t.name + "|" + (t["addr:street"] || "")).toLowerCase();
    if (seen.has("n:" + key)) continue;
    seen.add("n:" + key);
    const addr = [t["addr:street"], t["addr:housenumber"], t["addr:suburb"]].filter(Boolean).join(", ");
    out.push({
      osmId,
      nome: t.name,
      categoria: classificar ? classificar(t) : categoriaId,
      cidade,
      pais,
      lat: clat,
      lng: clng,
      telefone: t.phone || t["contact:phone"] || null,
      website: t.website || t["contact:website"] || null,
      instagram: t["contact:instagram"] || (t.instagram ? t.instagram : null),
      email: t.email || t["contact:email"] || null,
      endereco: addr,
    });
  }
  return out;
}
