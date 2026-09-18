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
  const idiomaLocal = l.pais || l.cidade || "Brasil";
  return `Você é um redator de prospecção B2B nativo do país/cidade do cliente. Escreva UMA mensagem de primeira abordagem (WhatsApp ou e-mail) apresentando a empresa ${l.negocio.negocio_nome}, que oferece: ${l.negocio.servico}. Diferenciais: ${l.negocio.diferenciais}.

Destinatário: "${l.nome}", um(a) ${cat.toLowerCase()} em ${l.cidade} (${l.pais}).
Sinais: ${l.temSite ? "já tem site (foco em melhorar/renovar)" : "NÃO tem site próprio (principal gancho)"}; ${l.temInstagram ? "tem Instagram" : "não tem Instagram"}; ${l.temEmail ? "tem e-mail público" : "sem e-mail público"}.

Regras RIGOROSAS:
1. IDIOMA OBRIGATÓRIO: A mensagem DEVE estar escrita EXCLUSIVAMENTE no idioma oficial e nativo da localidade do destinatário (${idiomaLocal}). Se for nos EUA, escreva em Inglês. Se for Itália, Italiano. Se Portugal ou Brasil, Português. NUNCA escreva em português se o negócio for de outro país!
2. 3 a 5 frases, tom humano e direto, sem formalidade excessiva
3. Cite o gancho específico (falta de site / presença no Google) e um benefício claro
4. Termine com uma pergunta simples de fechamento
5. NUNCA invente dados (estatísticas falsas, prêmios, números)
6. Responda SOMENTE com o texto da mensagem final traduzida para o idioma do cliente, sem aspas nem comentários adicionais.`;
}

function templateMsg(l: MsgInput): string {
  const cat = getCategoria(l.categoria)?.label || l.categoria;
  const p = (l.pais || "").toLowerCase();
  
  const isPt = p.match(/brasil|brazil|portugal|angola|mozambique|cape verde/);
  const isEsp = p.match(/spain|españa|mexico|colombia|argentina|peru|chile|ecuador|guatemala|cuba|bolivia|dominican|honduras|paraguay|salvador|nicaragua|costa rica|puerto rico|panama|uruguay|venezuela/);
  const isFr = p.match(/france|frança|belgium|belgique|switzerland|suisse|canada|senegal/);
  const isIt = p.match(/italy|itália|italia/);
  const isDe = p.match(/germany|alemanha|deutschland|austria/);

  const nome = l.negocio.negocio_nome;
  const nomePais = l.pais || l.cidade;

  if (isFr) {
    const gancho = l.temSite
      ? `j'ai vu que vous avez déjà une présence en ligne et j'aimerais vous aider à l'améliorer`
      : `j'ai remarqué que votre entreprise n'a pas de site web dédié — ce qui signifie que les personnes qui font des recherches sur Google aujourd'hui ne peuvent pas vous trouver`;
    return `Bonjour ${l.nome} ! Je fais partie de ${nome} et ${gancho}. Nous créons des sites web professionnels à ${l.cidade} (${nomePais}) — services, photos et réservations au même endroit, visibles sur Google. Puis-je vous envoyer un aperçu de ce à quoi cela pourrait ressembler ?`;
  }

  if (isIt) {
    const gancho = l.temSite
      ? `ho notato che avete già una presenza online e mi piacerebbe aiutarvi a migliorarla`
      : `ho notato che la vostra attività non ha un sito web dedicato — il che significa che chi cerca su Google oggi non riesce a trovarvi`;
    return `Ciao ${l.nome}! Lavoro con ${nome} e ${gancho}. Creiamo siti web professionali a ${l.cidade} (${nomePais}) — servizi, foto e prenotazioni in un unico posto, visibili su Google. Posso inviarvi un'anteprima di come verrebbe?`;
  }

  if (isDe) {
    const gancho = l.temSite
      ? `ich habe gesehen, dass Sie bereits online präsent sind, und würde Ihnen gerne helfen, dies weiter auszubauen`
      : `ich habe festgestellt, dass Ihr Unternehmen noch keine eigene Website hat — das bedeutet, dass Leute, die heute auf Google suchen, Sie nicht finden`;
    return `Hallo ${l.nome}! Ich bin von ${nome} und ${gancho}. Wir erstellen professionelle Websites in ${l.cidade} (${nomePais}) — Dienstleistungen, Fotos und Buchungen an einem Ort, sichtbar auf Google. Darf ich Ihnen eine Vorschau schicken, wie das aussehen könnte?`;
  }

  if (isEsp) {
    const gancho = l.temSite
      ? `vi que ya tienen presencia en línea y me encantaría ayudarles a llevarla al siguiente nivel`
      : `vi que su negocio opera sin un sitio web propio — lo que significa que quienes buscan en Google hoy no los encuentran`;
    return `¡Hola, ${l.nome}! Soy de ${nome} y ${gancho}. Creamos sitios web profesionales en ${l.cidade} (${nomePais}) — servicios, fotos y reservas en un solo lugar, visibles en Google. ¿Puedo enviarles una vista previa de cómo se vería?`;
  }

  if (isPt || !p) {
    // Fallback padrão (PT-BR)
    const gancho = l.temSite
      ? `vi que vocês já têm presença online e quero ajudar a levar isso para o próximo nível`
      : `vi que o ${cat.toLowerCase()} de vocês opera sem site próprio — ou seja, quem pesquisa no Google hoje não encontra vocês`;
    return `Olá, ${l.nome}! Sou da ${nome} e ${gancho}. Criamos sites profissionais para ${cat.toLowerCase()} em ${l.cidade} (${nomePais}) — serviços, fotos e agendamento num só lugar, visível no Google. Posso mandar uma prévia de como ficaria?`;
  }

  // Fallback genérico para o resto do mundo (Inglês)
  const gancho = l.temSite
    ? `I noticed you already have an online presence and I'd love to help you take it to the next level`
    : `I noticed your business doesn't have a dedicated website — meaning people searching on Google today can't easily find you`;
  return `Hi ${l.nome}! I'm with ${nome} and ${gancho}. We build professional websites in ${l.cidade} (${nomePais}) — combining your services, photos, and bookings in one place, fully visible on Google. Can I send you a quick preview of how it would look?`;
}

export async function gerarMensagem(l: MsgInput, apiKey: string | null): Promise<{ texto: string; fonte: "gemini" | "template" }> {
  if (apiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
