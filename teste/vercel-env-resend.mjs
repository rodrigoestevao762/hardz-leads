import { execSync } from "node:child_process";

// Uso: node teste\vercel-env-resend.mjs  (lê as chaves do .env.local, nunca hardcoded)
const fs = await import("node:fs");
const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1]?.trim();

const RESEND_KEY = get("RESEND_API_KEY");
const RESEND_FROM = get("RESEND_FROM");
if (!RESEND_KEY || !RESEND_FROM) { console.log("defina RESEND_API_KEY e RESEND_FROM no .env.local"); process.exit(1); }

const CWD = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:");

function setEnv(key, value) {
  try {
    execSync(`vercel env rm ${key} production --yes`, { encoding: "utf8", cwd: CWD, stdio: "pipe" });
    console.log(key + ": antiga removida");
  } catch {}
  execSync(`vercel env add ${key} production`, {
    input: value, // sem \n no final
    encoding: "utf8", cwd: CWD, stdio: "pipe",
  });
  console.log(key + ": salva limpa");
}

setEnv("RESEND_API_KEY", RESEND_KEY);
setEnv("RESEND_FROM", RESEND_FROM);
