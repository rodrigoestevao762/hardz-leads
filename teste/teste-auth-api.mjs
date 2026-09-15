import fs from "node:fs";

const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1]?.trim();
const URL_SUPA = get("NEXT_PUBLIC_SUPABASE_URL");
const KEY = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const BASE = process.env.BASE_URL || "http://localhost:3000";

const ref = URL_SUPA.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
const email = "teste@hardzleads.com";
const senha = "hardz1234";

const res = await fetch(`${URL_SUPA}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { "Content-Type": "application/json", apikey: KEY, Authorization: `Bearer ${KEY}` },
  body: JSON.stringify({ email, password: senha, gotrue_meta_security: { captcha_token: undefined } }),
});
const text = await res.text();
if (!res.ok) { console.log("LOGIN FALHOU", res.status, text.slice(0, 300)); process.exit(1); }
const session = JSON.parse(text);
console.log("LOGIN OK, user:", session.user?.email, "| confirmado:", session.user?.email_confirmed_at ? "sim" : "nao");

// Monta cookie no formato do @supabase/ssr
const cookieVal = "base64-" + Buffer.from(JSON.stringify(session), "utf8").toString("base64");
const cookieName = `sb-${ref}-auth-token`;

// Chama a API de busca do app com a sessao
const appRes = await fetch(`${BASE}/api/buscar`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: `${cookieName}=${encodeURIComponent(cookieVal)}` },
  body: JSON.stringify({ cidade: "Lisboa", categoria: "barbearia", pais: "Portugal" }),
});
const appText = await appRes.text();
console.log("API buscar:", appRes.status, "| corpo:", appText.slice(0, 300));

if (appRes.status === 200) {
  const { empresas, total } = JSON.parse(appText);
  console.log("TOTAL:", total);
  const alvo = empresas.find(e => e.email) || empresas[0];
  console.log("LEAD ESCOLHIDO:", alvo.nome, "| sem site:", !alvo.website);

  // Insere o lead no banco com a sessao do usuario
  const insRes = await fetch(`${URL_SUPA}/rest/v1/leads`, {
    method: "POST",
    headers: {
      apikey: KEY, Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json", Prefer: "return=representation",
      "Content-Profile": "public", "Accept-Profile": "public",
    },
    body: JSON.stringify([{
      user_id: session.user.id, nome: alvo.nome, categoria: alvo.categoria, cidade: alvo.cidade,
      pais: alvo.pais, lat: alvo.lat, lng: alvo.lng, telefone: alvo.telefone, website: alvo.website,
      instagram: alvo.instagram, email: alvo.email, fonte: "osm", osm_id: alvo.osmId,
      score: alvo.score, nivel: alvo.nivel,
    }]),
  });
  const insText = await insRes.text();
  let lead;
  if (!insRes.ok) {
    if (insRes.status !== 409) { console.log("INSERT FALHOU:", insRes.status, insText.slice(0, 300)); process.exit(1); }
    // já existe: busca pelo osm_id
    const qRes = await fetch(`${URL_SUPA}/rest/v1/leads?osm_id=eq.${encodeURIComponent(alvo.osmId)}&user_id=eq.${session.user.id}&select=*`, {
      headers: { apikey: KEY, Authorization: `Bearer ${session.access_token}`, "Accept-Profile": "public" },
    });
    lead = (await qRes.json())[0];
    console.log("LEAD JA EXISTIA id:", lead.id, "| nivel:", lead.nivel, "| score:", lead.score);
  } else {
    lead = JSON.parse(insText)[0];
    console.log("LEAD SALVO id:", lead.id, "| nivel:", lead.nivel, "| score:", lead.score);
  }

  // Gera mensagem via Gemini
  const genRes = await fetch(BASE+"/api/gerar-mensagem", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `${cookieName}=${encodeURIComponent(cookieVal)}` },
    body: JSON.stringify({ leadId: lead.id }),
  });
  const genText = await genRes.text();
  console.log("GERAR MENSAGEM:", genRes.status);
  try {
    const g = JSON.parse(genText);
    console.log("fonte:", g.fonte);
    console.log("---\n" + (g.texto || genText).slice(0, 400) + "\n---");
  } catch { console.log(genText.slice(0, 300)); }
}

