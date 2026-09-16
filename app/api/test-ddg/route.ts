import { NextResponse } from "next/server";

export async function GET() {
  const test = async (url: string) => {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const text = await res.text();
      return { ok: res.ok, status: res.status, snippet: text.substring(0, 300) };
    } catch (e: any) {
      return { error: e.message };
    }
  };

  return NextResponse.json({
    paulgo: await test("https://paulgo.io/search?q=barbearia+sao+paulo+site:instagram.com"),
    bing: await test("https://www.bing.com/search?q=barbearia+sao+paulo+site:instagram.com")
  });
}
