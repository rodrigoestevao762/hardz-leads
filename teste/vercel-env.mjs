import { execSync } from "node:child_process";
import fs from "node:fs";

const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1]?.trim() || "";

const vars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "GEMINI_API_KEY",
  "NEXT_PUBLIC_SITE_URL",
];

for (const v of vars) {
  const val = get(v);
  if (!val) { console.log(v + ": vazia, pulando"); continue; }
  try {
    execSync(`vercel env add ${v} production`, {
      input: val + "\n",
      encoding: "utf8",
      cwd: new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:"),
      stdio: ["pipe", "pipe", "pipe"],
    });
    console.log(v + ": configurada");
  } catch (e) {
    console.log(v + ": erro -> " + String(e.stderr || e.message).split("\n").slice(0, 2).join(" | "));
  }
}
