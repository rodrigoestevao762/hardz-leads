import fs from "node:fs";
const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1]?.trim();
const U = get("NEXT_PUBLIC_SUPABASE_URL"), K = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const login = await fetch(`${U}/auth/v1/token?grant_type=password`, {
  method: "POST", headers: { "Content-Type": "application/json", apikey: K },
  body: JSON.stringify({ email: "teste@prospectandoai.com", password: "hardz1234" }),
});
const s = await login.json();
console.log("login:", login.status, "| user:", s.user?.email || s.error_description);
const H = { apikey: K, Authorization: `Bearer ${s.access_token}`, "Accept-Profile": "public", "Content-Profile": "public" };
const leads = await (await fetch(`${U}/rest/v1/leads?select=id,nome&order=criado_em.asc`, { headers: H })).json();
console.log("leads visiveis:", leads.length, "| primeiro:", leads[0]?.nome);
const land = await (await fetch(`${U}/rest/v1/landings?select=slug,publicada`, { headers: H })).json();
console.log("landings:", JSON.stringify(land));
