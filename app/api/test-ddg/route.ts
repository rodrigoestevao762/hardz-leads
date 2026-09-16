export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "barbearia sao paulo site:instagram.com";
    
    const res = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}&cc=br`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36" },
      cache: "no-store"
    });
    
    const text = await res.text();
    
    return NextResponse.json({ ok: res.ok, status: res.status, length: text.length, snippet: text.substring(0, 500) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
