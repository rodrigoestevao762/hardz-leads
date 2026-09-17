export async function buscarOutscraper(query: string, apiKey: string) {
  const params = new URLSearchParams({
    query: query,
    limit: "50",
    language: "pt",
  });

  const res = await fetch(`https://api.outscraper.com/maps/search-v3?${params.toString()}`, {
    method: "GET",
    headers: {
      "X-API-KEY": apiKey,
    },
  });

  if (!res.ok) throw new Error("Erro na API Outscraper: " + res.status);

  const json = await res.json();
  const data = json.data || [];
  if (data.length === 0) return [];

  const results = data[0] || [];
  
  return results.map((e: any) => {
    return {
      osmId: "out_" + e.place_id,
      nome: e.name || "Empresa Desconhecida",
      categoria: e.type || e.subtypes?.[0] || "Empresa",
      cidade: e.city || "",
      pais: e.country || "",
      endereco: e.full_address || "",
      telefone: e.phone || null,
      website: e.site || null,
      instagram: e.verified_link || e.instagram || null,
      email: e.emails?.[0] || e.email || null,
      facebook: e.facebook || null,
      fonte: "outscraper",
    };
  });
}
