// Busca de empresas via Overpass API (OpenStreetMap) — gratuita, sem chave.
// Docs: https://overpass-api.de/ — respeitar limites de uso (1 req/s).

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

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
  const res = await fetch(url, { headers: { "User-Agent": "HardZLeads/1.0 (prospeccao)" } });
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

/** Busca empresas por tags num raio ao redor do ponto. */
export async function buscarEmpresas(
  categoriaId: string,
  tags: string[],
  lat: number,
  lng: number,
  radiusM: number,
  cidade: string,
  pais: string
): Promise<EmpresaOSM[]> {
  const around = `(around:${radiusM},${lat},${lng})`;
  const selectors = tags.map((t) => {
    if (t.includes("~")) {
      const [k, v] = t.split("~");
      return `nwr["${k}"~"${esc(v)}",i]${around};`;
    }
    const [k, v] = t.split("=");
    return `nwr["${k}"="${esc(v)}"]${around};`;
  });
  const query = `[out:json][timeout:40];(${selectors.join("")});out center 120;`;

  const UA = { "User-Agent": "HardZLeads/1.0 (prospeccao de empresas)" };

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...UA },
    body: "data=" + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const json = await res.json();

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
      categoria: categoriaId,
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
