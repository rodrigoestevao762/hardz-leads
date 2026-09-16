import fs from "node:fs";

const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1]?.trim();
const URL_SUPA = get("NEXT_PUBLIC_SUPABASE_URL");
const KEY = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const BASE = "https://prospectandoai.vercel.app";
const ref = URL_SUPA.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

const login = await fetch(`${URL_SUPA}/auth/v1/token?grant_type=password`, {
  method: "POST", headers: { "Content-Type": "application/json", apikey: KEY },
  body: JSON.stringify({ email: "teste@prospectandoai.com", password: "hardz1234" }),
});
const session = await login.json();
const cookie = `sb-${ref}-auth-token=${encodeURIComponent("base64-" + Buffer.from(JSON.stringify(session), "utf8").toString("base64"))}`;
console.log("login ok:", session.user?.email);

// 1) mapa: busca por cidade
const mapa = await fetch(`${BASE}/api/buscar-mapa`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ cidade: "Lisboa", categoriaId: "barbearia" }),
});
const m = await mapa.json();
console.log("buscar-mapa (cidade):", mapa.status, "| cidade:", m.cidade, "| pais:", m.pais, "| resultados:", m.resultados?.length);
const r0 = m.resultados?.[0];
if (r0) console.log("melhor:", r0.nome, "|", r0.categoria, "|", r0.nivel, r0.score, "| site?", !!r0.website, "| email?", !!r0.email);

// 2) mapa: clique (lat/lng de Campinas-SP) — geocodificacao reversa
const clique = await fetch(`${BASE}/api/buscar-mapa`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ lat: -22.9056, lng: -47.0608, categoriaId: "academia" }),
});
const c = await clique.json();
console.log("buscar-mapa (clique):", clique.status, "| cidade detectada:", c.cidade, "/", c.pais, "| resultados:", c.resultados?.length);

// 3) envio automatico: cria lead de teste com email do proprio Rodrigo
const H = { apikey: KEY, Authorization: `Bearer ${session.access_token}`, "Accept-Profile": "public", "Content-Profile": "public" };
const novo = await fetch(`${URL_SUPA}/rest/v1/leads`, {
  method: "POST", headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation" },
  body: JSON.stringify([{
    user_id: session.user.id, nome: "Teste Envio Auto", categoria: "barbearia", cidade: "Lisboa", pais: "Portugal",
    email: "rodrigoestevao762@gmail.com", fonte: "osm", osm_id: "teste/auto-" + Date.now(), score: 70, nivel: "quente",
  }]),
});
const nv = (await novo.json())[0];
console.log("lead de teste criado:", novo.status, nv?.id);
const auto = await fetch(`${BASE}/api/enviar-automatico`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ leadId: nv.id }),
});
const aj = await auto.json();
console.log("enviar-automatico:", auto.status, "| fonte:", aj.fonte, "| texto:", (aj.texto || aj.erro || "").slice(0, 120));

// limpa o lead de teste
await fetch(`${URL_SUPA}/rest/v1/leads?id=eq.${nv.id}`, { method: "DELETE", headers: H });
console.log("lead de teste removido (messages ficam como log)");
