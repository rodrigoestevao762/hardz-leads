import { NextResponse } from "next/server";

export async function GET() {
  const test = async (url: string) => {
    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { headers: { "User-Agent": "Mozilla/5.0" } });
      const json = await res.json();
      return { ok: res.ok, status: res.status, length: json.contents?.length, snippet: json.contents?.substring(0, 300) };
    } catch (e: any) {
      return { error: e.message };
    }
  };

  return NextResponse.json({
    ddg: await test("https://html.duckduckgo.com/html/?q=barbearia+sao+paulo+site:instagram.com"),
    bing: await test("https://www.bing.com/search?q=barbearia+sao+paulo+site:instagram.com")
  });
}
