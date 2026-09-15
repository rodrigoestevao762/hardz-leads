// Qualificação de leads: sem site = lead quente para quem vende sites.
export type QualInput = {
  website?: string | null;
  instagram?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
};

export type QualResult = { score: number; nivel: "quente" | "morno" | "frio" };

export function qualificar(l: QualInput): QualResult {
  let score = 0;
  const semSite = !l.website || /facebook|instagram|linktr\.ee|whats|wa\.me|api\.whatsapp/i.test(l.website);
  if (semSite) score += 40;
  if (l.instagram) score += 20;
  if (l.email) score += 20;
  if (l.telefone) score += 10;
  if (l.endereco) score += 10;
  const nivel = score >= 70 ? "quente" : score >= 40 ? "morno" : "frio";
  return { score, nivel };
}
