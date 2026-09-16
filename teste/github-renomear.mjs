import { execSync } from "node:child_process";

const out = execSync("git credential fill", {
  input: "protocol=https\nhost=github.com\n\n",
  encoding: "utf8",
  cwd: new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:"),
});
const token = (out.match(/^password=(.*)$/m) || [])[1];

const res = await fetch("https://api.github.com/repos/rodrigoestevao762/hardz-leads", {
  method: "PATCH",
  headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "rename" },
  body: JSON.stringify({ name: "prospectandoai", description: "Prospecção mundial de leads com IA (Next.js + Supabase + Gemini + Resend)" }),
});
const j = await res.json();
console.log(res.status, j.full_name || j.message);
