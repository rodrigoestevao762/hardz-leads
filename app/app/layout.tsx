"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const LINKS = [
  { href: "/app", label: "Leads" },
  { href: "/app/busca", label: "Buscar empresas" },
  { href: "/app/mapa", label: "Mapa mundial" },
  { href: "/app/insta", label: "Radar Insta" },
  { href: "/app/foods", label: "Radar Foods" },
  { href: "/app/configuracoes", label: "Configurações" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  return (
    <div className="bg-void min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(3,6,9,0.85)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-1.5 px-4 py-3">
          <Link href="/app" className="mr-5 flex items-center gap-2.5">
            <span className="radar h-7 w-7"><span className="radar-sweep" /></span>
            <span className="headline text-xs font-bold uppercase tracking-widest">
              Prospectando<span className="text-signal-glow">AI</span>
            </span>
          </Link>
          {LINKS.map((l) => (
            <Link
              key={l.href} href={l.href}
              className={`mono rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-widest transition ${
                path === l.href
                  ? "bg-[rgba(45,255,180,0.12)] text-[var(--signal)] shadow-[inset_0_0_0_1px_rgba(45,255,180,0.35)]"
                  : "text-[var(--ink-dim)] hover:bg-white/5 hover:text-[var(--ink)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={async () => { await supabaseBrowser().auth.signOut(); router.push("/login"); }}
            className="mono ml-auto rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-widest text-[var(--ink-faint)] transition hover:bg-white/5 hover:text-[var(--ink)]"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-7">{children}</main>
    </div>
  );
}
