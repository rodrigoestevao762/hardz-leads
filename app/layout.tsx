import type { Metadata } from "next";
import { Unbounded, Sora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  weight: ["400", "600", "700", "800"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ProspectandoAI — Radar global de leads sem site",
  description:
    "Encontre empresas em todo o mundo que ainda não têm site, qualifique automaticamente e gere mensagens personalizadas com IA no idioma de cada país.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${unbounded.variable} ${sora.variable} ${plexMono.variable} noise`}>
        {children}
      </body>
    </html>
  );
}
