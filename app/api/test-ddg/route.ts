import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://www.google.com/search?q=barbearia+sao+paulo+site:instagram.com", { headers: { "User-Agent": "Mozilla/5.0" } });
    const text = await res.text();
    return new NextResponse(text, { headers: { "Content-Type": "text/html" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
