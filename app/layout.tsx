import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HardZ Leads — Prospecção mundial",
  description: "Busque empresas, qualifique leads e envie mensagens personalizadas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
