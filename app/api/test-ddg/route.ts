import { NextResponse } from "next/server";

export async function GET() {
  const test = async (url: string) => {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      return { ok: res.ok, status: res.status, length: (await res.text()).length };
    } catch (e: any) {
      return { error: e.message };
    }
  };

  return NextResponse.json({
    searxwork: await test("https://searx.work/search?q=barbearia+sao+paulo+site:instagram.com"),
    paulgo: await test("https://paulgo.io/search?q=barbearia+sao+paulo+site:instagram.com"),
    tiekoetter: await test("https://searx.tiekoetter.com/search?q=barbearia+sao+paulo+site:instagram.com"),
    duckduckgo: await test("https://html.duckduckgo.com/html/?q=barbearia+sao+paulo"),
    bing: await test("https://www.bing.com/search?q=barbearia+sao+paulo")
  });
}
