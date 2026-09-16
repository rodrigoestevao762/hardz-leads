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
    
    // Extract base64
    const b64 = text.match(/aHR0c[a-zA-Z0-9+\/]+/g) || [];
    const decoded = b64.map(b => {
      try { return Buffer.from(b, 'base64').toString('utf8'); } catch(e) { return ""; }
    }).filter(u => u.includes('instagram.com') || u.includes('ifood.com.br'));
    
    return NextResponse.json({ ok: res.ok, status: res.status, decoded });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
