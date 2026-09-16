import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://lite.duckduckgo.com/lite/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0" },
      body: "q=barbearia+sao+paulo+site:instagram.com"
    });
    const text = await res.text();
    return NextResponse.json({ ok: res.ok, status: res.status, text: text.substring(0, 500) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
