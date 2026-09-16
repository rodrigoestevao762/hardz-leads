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
console.log("login ok");

const H = { apikey: KEY, Authorization: `Bearer ${session.access_token}`, "Accept-Profile": "public", "Content-Profile": "public" };
const lead = (await (await fetch(`${URL_SUPA}/rest/v1/leads?nome=eq.Aspectus%20%7C%20Male%20Image&select=*`, { headers: H })).json())[0];
console.log("lead:", lead.nome);

// 1) gera landing com IA
const gen = await fetch(`${BASE}/api/gerar-landing`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ leadId: lead.id }),
});
const genJ = await gen.json();
console.log("gerar-landing:", gen.status);
if (!gen.ok) { console.log(genJ); process.exit(1); }
const t = genJ.textos;
console.log("eyebrow:", t.eyebrow);
console.log("h1:", t.h1a, "/", t.h1b);
console.log("sub:", (t.sub || "").slice(0, 100));
console.log("servicos:", Array.isArray(t.servicos) ? t.servicos.length : "ERRO", "| bullets:", Array.isArray(t.bullets) ? t.bullets.length : "ERRO");
console.log("servico[0]:", t.servicos?.[0]?.titulo, "|", t.servicos?.[0]?.preco);

// 2) salva ajuste manual (simula edição do usuário)
const t2 = JSON.parse(JSON.stringify(t));
t2.h1b = "quem é.";
const save = await fetch(`${BASE}/api/salvar-landing`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ leadId: lead.id, textos: t2, accent: "#b8860b", tema: "claro" }),
});
console.log("salvar-landing:", save.status, JSON.stringify(await save.json()));

// 3) confere persistência
await new Promise((r) => setTimeout(r, 1200));
const land = (await (await fetch(`${URL_SUPA}/rest/v1/landings?lead_id=eq.${lead.id}&select=accent,tema,textos`, { headers: H })).json())[0];
console.log("persistido:", JSON.stringify({ accent: land?.accent, tema: land?.tema, h1b: land?.textos?.h1b }));
