"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const LINKS = [
  { href: "/app", label: "Leads" },
  { href: "/app/busca", label: "Buscar empresas" },
  { href: "/app/configuracoes", label: "Configurações" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-700/60 bg-[#111831]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <Link href="/app" className="mr-4 font-bold">HardZ <span className="text-[#4f7cff]">Leads</span></Link>
          {LINKS.map((l) => (
            <Link
              key={l.href} href={l.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${path === l.href ? "bg-[#4f7cff] text-white" : "text-slate-300 hover:bg-slate-700/40"}`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={async () => { await supabaseBrowser().auth.signOut(); router.push("/login"); }}
            className="ml-auto rounded-lg px-3 py-1.5 text-sm text-slate-400 transition hover:bg-slate-700/40 hover:text-white"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
