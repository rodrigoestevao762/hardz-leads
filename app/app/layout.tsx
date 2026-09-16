"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const LINKS = [
  { href: "/app",              label: "Leads",          icon: "⊕" },
  { href: "/app/busca",        label: "Buscar",         icon: "⊙" },
  { href: "/app/mapa",         label: "Mapa",           icon: "◎" },
  { href: "/app/insta",        label: "Radar Insta",    icon: "◈" },
  { href: "/app/foods",        label: "Radar Foods",    icon: "⊛" },
  { href: "/app/configuracoes",label: "Config",         icon: "⊗" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();

  return (
    <div className="bg-void min-h-screen">
      {/* Ambient bg */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="aurora opacity-40" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[var(--line)]" style={{
        background: "rgba(3, 6, 9, 0.82)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      }}>
        {/* Top scan accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--signal)]/30 to-transparent" />

        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2.5">
          {/* Logo */}
          <Link href="/app" className="mr-6 flex items-center gap-2.5 shrink-0">
            <div className="relative h-8 w-8">
              <div className="radar h-full w-full" style={{ transform: "scale(1)" }}>
                <div className="radar-sweep" />
                <div className="crosshair-v" style={{ left: "50%", top: "10%", bottom: "10%", width: 1 }} />
                <div className="crosshair-h" style={{ top: "50%", left: "10%", right: "10%", height: 1 }} />
                <span className="blip" style={{ left: "30%", top: "35%", animationDelay: "1s", width: 4, height: 4 }} />
                <span className="blip amber" style={{ left: "60%", top: "55%", animationDelay: "2.5s", width: 4, height: 4 }} />
              </div>
            </div>
            <span className="headline text-[11px] font-bold uppercase tracking-[0.15em]">
              Prospectando<span className="text-signal-glow">AI</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
            {LINKS.map((l) => {
              const active = path === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-link shrink-0 ${active ? "active" : ""}`}
                >
                  <span className="text-[10px]">{l.icon}</span>
                  <span>{l.label}</span>
                  {active && <span className="tab-active" />}
                </Link>
              );
            })}
          </nav>

          {/* Signout */}
          <button
            onClick={async () => { await supabaseBrowser().auth.signOut(); router.push("/login"); }}
            className="mono ml-auto shrink-0 rounded-lg px-3 py-1.5 text-[10px] uppercase tracking-widest text-[var(--ink-faint)] transition hover:bg-[var(--alert)]/10 hover:text-[var(--alert)] border border-transparent hover:border-[var(--alert)]/30"
          >
            Sair ×
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
