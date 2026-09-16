export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const res = await fetch(`https://www.ask.com/web?q=pizzaria+sao+paulo+site:instagram.com`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36" },
      cache: "no-store"
    });
    
    const text = await res.text();
    return new NextResponse(text, { headers: { "Content-Type": "text/html" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
