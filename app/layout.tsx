import type { Metadata } from "next";
import { Chakra_Petch, Fira_Code, Orbitron } from "next/font/google";
import "./globals.css";

const chakra = Chakra_Petch({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500", "600", "700"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-impact",
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "ProspectandoAI — OSINT Terminal",
  description: "Advanced B2B prospecting terminal. Global radar, OSINT capabilities, AI message generation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${chakra.variable} ${firaCode.variable} ${orbitron.variable} noise`}>
        {children}
      </body>
    </html>
  );
}

