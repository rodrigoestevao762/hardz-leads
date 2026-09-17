// Gerador de mensagem individual: Gemini (grátis) com fallback para templates.
import { getCategoria } from "./categorias";

export type MsgInput = {
  nome: string;
  categoria: string;
  cidade: string;
  pais: string;
  temSite: boolean;
  temInstagram: boolean;
  temEmail: boolean;
  negocio: { negocio_nome: string; servico: string; diferenciais: string };
};

export function idiomaDoPais(pais: string, cidade: string): string {
  if (!pais && !cidade) return "português do Brasil";
  return `o idioma oficial e nativo de ${cidade}, ${pais}`;
}

function promptMsg(l: MsgInput): string {
  const cat = getCategoria(l.categoria)?.label || l.categoria;
  const idioma = idiomaDoPais(l.pais, l.cidade);
  return `Você é um redator de prospecção B2B. Escreva UMA mensagem de primeira abordagem (WhatsApp ou e-mail) apresentando ${l.negocio.negocio_nome}, que oferece: ${l.negocio.servico}. Diferenciais: ${l.negocio.diferenciais}.

Destinatário: "${l.nome}", um(a) ${cat.toLowerCase()} em ${l.cidade} (${l.pais}).
Sinais: ${l.temSite ? "já tem site (foco em melhorar/renovar)" : "NÃO tem site próprio (principal gancho)"}; ${l.temInstagram ? "tem Instagram" : "não tem Instagram"}; ${l.temEmail ? "tem e-mail público" : "sem e-mail público"}.

Regras:
- Idioma: Escreva estritamente em ${idioma}. Se não for possível determinar, use português do Brasil.
- 3 a 5 frases, tom humano e direto, sem formalidade excessiva
- Cite o gancho específico (falta de site / presença no Google) e um benefício claro
- Termine com uma pergunta simples de fechamento
- Não invente dados (nada de estatísticas falsas, prêmios ou números)
- Responda SOMENTE com o texto da mensagem, sin aspas ni comentarios`;
}

function templateMsg(l: MsgInput): string {
  const cat = getCategoria(l.categoria)?.label || l.categoria;
  const gancho = l.temSite
    ? `vi que vocês já têm presença online e quero ajudar a levar isso para o próximo nível`
    : `vi que o ${cat.toLowerCase()} de vocês opera sem site próprio — ou seja, quem pesquisa no Google hoje não encontra vocês`;
  const nome = l.negocio.negocio_nome;
  const nomePais = l.pais || l.cidade;
  return `Olá, ${l.nome}! Sou da ${nome} e ${gancho}. Criamos sites profissionais para ${cat.toLowerCase()} em ${l.cidade} (${nomePais}) — serviços, fotos e agendamento num só lugar, visível no Google. Posso mandar uma prévia de como ficaria?`;
}

export async function gerarMensagem(l: MsgInput, apiKey: string | null): Promise<{ texto: string; fonte: "gemini" | "template" }> {
  if (apiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptMsg(l) }] }] }),
        }
      );
      if (res.ok) {
        const json = await res.json();
        const texto = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (texto) return { texto, fonte: "gemini" };
      }
    } catch {
      // cai para template
    }
  }
  return { texto: templateMsg(l), fonte: "template" };
}
