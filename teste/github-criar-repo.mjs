import { execSync } from "node:child_process";

const out = execSync("git credential fill", {
  input: "protocol=https\nhost=github.com\n\n",
  encoding: "utf8",
  cwd: new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:"),
});
const token = (out.match(/^password=(.*)$/m) || [])[1];
if (!token) { console.log("sem token salvo"); process.exit(1); }

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "hardz-leads-setup",
};

// 1) verifica usuario
const me = await fetch("https://api.github.com/user", { headers });
if (!me.ok) { console.log("token invalido:", me.status); process.exit(1); }
const user = await me.json();
console.log("conta:", user.login);

// 2) cria o repo se nao existir
const create = await fetch("https://api.github.com/user/repos", {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "hardz-leads",
    description: "SaaS de prospeccao mundial de leads (Next.js + Supabase + Gemini)",
    private: false,
    auto_init: false,
  }),
});
if (create.ok) console.log("repo criado: hardz-leads");
else {
  const err = await create.json();
  if (err.errors?.some(e => e.message === "name already exists on this account") || err.message === "name already exists on this account") {
    console.log("repo ja existe: hardz-leads");
  } else {
    console.log("criacao falhou:", create.status, err.message);
    process.exit(1);
  }
}
console.log("REMOTE_URL=https://github.com/" + user.login + "/hardz-leads.git");
