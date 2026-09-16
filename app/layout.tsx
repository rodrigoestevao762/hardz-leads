import type { Metadata } from "next";
import { Unbounded, Space_Grotesk, JetBrains_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  weight: ["400", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "ProspectandoAI — Radar global de leads sem site",
  description:
    "Encontre empresas em todo o mundo que ainda não têm site, qualifique automaticamente e gere mensagens personalizadas com IA no idioma de cada país.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${unbounded.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${bebasNeue.variable} noise`}>
        {children}
      </body>
    </html>
  );
}
