import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res1 = await fetch("https://html.duckduckgo.com/html/?q=barbearia+sao+paulo+site:instagram.com", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    
    const res2 = await fetch("https://search.yahoo.com/search?p=barbearia+sao+paulo+site:instagram.com", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const res3 = await fetch("https://www.bing.com/search?q=barbearia+sao+paulo+site:instagram.com", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    
    return NextResponse.json({
      ddg: { ok: res1.ok, status: res1.status, length: (await res1.text()).length },
      yahoo: { ok: res2.ok, status: res2.status, length: (await res2.text()).length },
      bing: { ok: res3.ok, status: res3.status, length: (await res3.text()).length }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
