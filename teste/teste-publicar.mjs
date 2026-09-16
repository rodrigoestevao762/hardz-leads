import fs from "node:fs";

const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1]?.trim();
const URL_SUPA = get("NEXT_PUBLIC_SUPABASE_URL");
const KEY = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const BASE = "https://prospectandoai.vercel.app";
const ref = URL_SUPA.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

const login = await fetch(`${URL_SUPA}/auth/v1/token?grant_type=password`, {
  method: "POST", headers: { "Content-Type": "application/json", apikey: KEY },
  body: JSON.stringify({ email: "teste@hardzleads.com", password: "hardz1234" }),
});
const session = await login.json();
const cookie = `sb-${ref}-auth-token=${encodeURIComponent("base64-" + Buffer.from(JSON.stringify(session), "utf8").toString("base64"))}`;
console.log("login ok");

const H = { apikey: KEY, Authorization: `Bearer ${session.access_token}`, "Accept-Profile": "public", "Content-Profile": "public" };
const lead = (await (await fetch(`${URL_SUPA}/rest/v1/leads?nome=eq.Aspectus%20%7C%20Male%20Image&select=*`, { headers: H })).json())[0];
console.log("lead:", lead.nome);

// 1) publica
const pub = await fetch(`${BASE}/api/publicar-landing`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ leadId: lead.id }),
});
const pubJ = await pub.json();
console.log("publicar:", pub.status, JSON.stringify(pubJ));
if (!pub.ok) process.exit(1);

// 2) acessa a URL pública (sem cookie)
await new Promise((r) => setTimeout(r, 1500));
const site = await fetch(pubJ.url);
const html = await site.text();
console.log("GET", pubJ.url, "->", site.status, "|", site.headers.get("content-type"));
console.log("tem h1:", html.includes("<h1>"), "| tem telefone:", html.includes((lead.telefone || "").replace(/[^\d+]/g, "")) || "sem telefone no lead");
console.log("title:", (html.match(/<title>([^<]+)<\/title>/) || [])[1]);

// 3) despublica e confere 404, depois publica de volta
const des = await fetch(`${BASE}/api/publicar-landing`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ leadId: lead.id, publicar: false }),
});
console.log("despublicar:", des.status, JSON.stringify(await des.json()));
await new Promise((r) => setTimeout(r, 1500));
const fora = await fetch(pubJ.url);
console.log("GET despublicado ->", fora.status, fora.status === 404 ? "(404 correto)" : "(ERRO)");

const volta = await fetch(`${BASE}/api/publicar-landing`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ leadId: lead.id }),
});
const voltaJ = await volta.json();
console.log("publicado de volta:", volta.status, voltaJ.url);

// 4) confere persistência no banco
const land = (await (await fetch(`${URL_SUPA}/rest/v1/landings?lead_id=eq.${lead.id}&select=slug,publicada,dados`, { headers: H })).json())[0];
console.log("banco:", JSON.stringify({ slug: land?.slug, publicada: land?.publicada, nome: land?.dados?.nome }));
