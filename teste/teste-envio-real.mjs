import fs from "node:fs";

const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1]?.trim();
const URL_SUPA = get("NEXT_PUBLIC_SUPABASE_URL");
const KEY = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const BASE = "https://prospectandoai.vercel.app";

const ref = URL_SUPA.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

// 1) login do usuário de teste
const res = await fetch(`${URL_SUPA}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { "Content-Type": "application/json", apikey: KEY },
  body: JSON.stringify({ email: "teste@prospectandoai.com", password: "hardz1234" }),
});
if (!res.ok) { console.log("LOGIN FALHOU", res.status); process.exit(1); }
const session = await res.json();
const cookieName = `sb-${ref}-auth-token`;
const cookieVal = "base64-" + Buffer.from(JSON.stringify(session), "utf8").toString("base64");
const cookie = `${cookieName}=${encodeURIComponent(cookieVal)}`;
console.log("login ok");

const H = { apikey: KEY, Authorization: `Bearer ${session.access_token}`, "Accept-Profile": "public", "Content-Profile": "public" };

// 2) pega o lead real salvo (Aspectus)
const q = await fetch(`${URL_SUPA}/rest/v1/leads?nome=eq.Aspectus%20%7C%20Male%20Image&select=*`, { headers: H });
const lead = (await q.json())[0];
if (!lead) { console.log("lead nao encontrado"); process.exit(1); }
console.log("lead:", lead.nome, "| email:", lead.email, "| status:", lead.status, "| score:", lead.score);

// 3) gera a mensagem com IA
const gen = await fetch(`${BASE}/api/gerar-mensagem`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ leadId: lead.id }),
});
const genJ = await gen.json();
if (!gen.ok) { console.log("GERAR FALHOU:", gen.status, genJ); process.exit(1); }
console.log("mensagem gerada (fonte:", genJ.fonte + "):\n---\n" + genJ.texto + "\n---");

// 4) envia o e-mail de verdade
const send = await fetch(`${BASE}/api/enviar-email`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ leadId: lead.id, texto: genJ.texto }),
});
const sendJ = await send.json();
console.log("ENVIO:", send.status, JSON.stringify(sendJ));
if (!send.ok) process.exit(1);

// 5) confere no banco: log da mensagem + status do lead
await new Promise((r) => setTimeout(r, 1500));
const m = await fetch(`${URL_SUPA}/rest/v1/messages?lead_id=eq.${lead.id}&order=criado_em.desc&limit=1&select=canal,status,erro,criado_em`, { headers: H });
console.log("log messages:", JSON.stringify(await m.json()));
const l2 = await fetch(`${URL_SUPA}/rest/v1/leads?id=eq.${lead.id}&select=status,canal`, { headers: H });
console.log("lead agora:", JSON.stringify(await l2.json()));
