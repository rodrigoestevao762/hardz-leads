import fs from "node:fs";
const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1]?.trim();
const U = get("NEXT_PUBLIC_SUPABASE_URL"), K = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const r = await fetch(`${U}/auth/v1/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json", apikey: K },
  body: JSON.stringify({ email: "teste@prospectandoai.com", password: "hardz1234" }),
});
const j = await r.json();
console.log("signup:", r.status);
console.log("confirmado:", !!j.user?.email_confirmed_at || j.user?.confirmed_at || "(sem session -> precisa confirmar e-mail)");
console.log("id:", j.user?.id || null);
console.log("tem session:", !!j.access_token);
