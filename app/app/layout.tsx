"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { motion } from "framer-motion";
import { Crosshair, Map, Radar, ScanSearch, Settings, Database, LogOut } from "lucide-react";

const LINKS = [
  { href: "/app",              label: "LEADS",          icon: <Database size={14} /> },
  { href: "/app/busca",        label: "SEARCH",         icon: <ScanSearch size={14} /> },
  { href: "/app/mapa",         label: "GLOBE",          icon: <Map size={14} /> },
  { href: "/app/insta",        label: "OSINT_INSTA",    icon: <Radar size={14} /> },
  { href: "/app/foods",        label: "OSINT_FOODS",    icon: <Crosshair size={14} /> },
  { href: "/app/configuracoes",label: "CONFIG",         icon: <Settings size={14} /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();

  return (
    <div className="bg-void min-h-screen selection:bg-[var(--signal)] selection:text-black">
      {/* Ambient bg */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-30" style={{ zIndex: 0 }}>
        <div className="aurora" />
        <div className="scan-line" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--deep)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-3">
          {/* Logo */}
          <Link href="/app" className="mr-8 flex items-center gap-2 shrink-0">
            <div className="h-2 w-2 rounded-full bg-[var(--signal)] animate-pulse" />
            <span className="headline text-[12px] font-bold tracking-[0.2em] text-white">
              PROSPECTANDO<span className="text-[var(--signal)]">AI</span>_
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {LINKS.map((l) => {
              const active = path === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-link shrink-0 ${active ? "active" : ""}`}
                >
                  {l.icon}
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Signout */}
          <button
            onClick={async () => { await supabaseBrowser().auth.signOut(); router.push("/login"); }}
            className="mono ml-auto flex shrink-0 items-center gap-2 rounded px-3 py-1.5 text-[10px] uppercase tracking-widest text-[var(--ink-faint)] transition hover:bg-[var(--alert)]/10 hover:text-[var(--alert)]"
          >
            <LogOut size={12} /> EXIT
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
