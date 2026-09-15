import fs from "node:fs";
const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1]?.trim();
console.log("prefixo da chave:", KEY.slice(0, 6) + "...", "| tamanho:", KEY.length);

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: "Responda apenas: OK" }] }] }),
  }
);
const body = await res.text();
console.log("STATUS:", res.status);
console.log(body.slice(0, 400));
