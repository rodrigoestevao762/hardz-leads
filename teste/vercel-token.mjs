import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const bases = [
  path.join(os.homedir(), "AppData", "Local", "com.vercel.cli"),
  path.join(os.homedir(), ".vercel"),
  path.join(os.homedir(), ".config", "com.vercel.cli"),
  path.join(os.homedir(), "AppData", "Roaming", "com.vercel.cli"),
  path.join(os.homedir(), ".local", "share", "com.vercel.cli"),
];
for (const b of bases) {
  try {
    const files = fs.readdirSync(b);
    console.log("DIR", b, "->", files.join(", "));
    for (const f of files) {
      if (/auth|token/i.test(f)) {
        const c = fs.readFileSync(path.join(b, f), "utf8");
        console.log("  conteudo:", c.slice(0, 120));
      }
    }
  } catch {}
}
