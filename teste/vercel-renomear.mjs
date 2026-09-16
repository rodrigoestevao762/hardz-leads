import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// token do CLI da Vercel
const candidates = [
  path.join(os.homedir(), "AppData", "Local", "com.vercel.cli", "auth.json"),
  path.join(os.homedir(), ".vercel", "auth.json"),
];
let token = null;
for (const p of candidates) {
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    token = j.token || j.data?.token;
    if (token) { console.log("token lido de:", p); break; }
  } catch {}
}
if (!token) { console.log("sem token"); process.exit(1); }

const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

// 1) renomeia o projeto
const ren = await fetch("https://api.vercel.com/v9/projects/hardz-leads", {
  method: "PATCH", headers: H,
  body: JSON.stringify({ name: "prospectandoai" }),
});
const renJ = await ren.json();
console.log("rename:", ren.status, renJ.name || renJ.error?.message);

// 2) atualiza NEXT_PUBLIC_SITE_URL
const list = await fetch("https://api.vercel.com/v9/projects/prospectandoai/env?target=production", { headers: H });
const listJ = await list.json();
const envVar = (listJ.envs || []).find(e => e.key === "NEXT_PUBLIC_SITE_URL");
if (envVar) {
  const del = await fetch(`https://api.vercel.com/v9/projects/prospectandoai/env/${envVar.id}?target=production`, { method: "DELETE", headers: H });
  console.log("delete SITE_URL:", del.status);
}
const add = await fetch("https://api.vercel.com/v10/projects/prospectandoai/env", {
  method: "POST", headers: H,
  body: JSON.stringify({ key: "NEXT_PUBLIC_SITE_URL", value: "https://prospectandoai.vercel.app", type: "plain", target: ["production"] }),
});
console.log("add SITE_URL:", add.status);
