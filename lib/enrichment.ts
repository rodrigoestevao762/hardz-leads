import { createClient } from '@supabase/supabase-js';

// Função auxiliar para fazer o fetch com timeout e headers que disfarçam o bot
async function fetchHtml(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: AbortSignal.timeout(8000) // 8 seg de limite
    });
    return await res.text();
  } catch (err) {
    return '';
  }
}

// 3 Motores de Busca Diferentes (Estratégia OSINT)
async function searchYahoo(query: string): Promise<string> {
  return await fetchHtml(`https://search.yahoo.com/search?p=${encodeURIComponent(query)}`);
}

async function searchBing(query: string): Promise<string> {
  return await fetchHtml(`https://www.bing.com/search?q=${encodeURIComponent(query)}`);
}

async function searchDuckDuckGo(query: string): Promise<string> {
  return await fetchHtml(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
}

function extractSocialLinks(html: string) {
  // Extrai Instagram (ignorando posts/reels/etc)
  const instaMatches = html.match(/instagram\.com\/([A-Za-z0-9_.]+)/gi) || [];
  const instagram = instaMatches.find(link => !link.includes('/p/') && !link.includes('/reel/') && !link.includes('/explore/') && !link.includes('/stories/'));

  // Extrai Facebook (ignorando rotas genéricas)
  const fbMatches = html.match(/facebook\.com\/([A-Za-z0-9_.-]+)/gi) || [];
  const facebook = fbMatches.find(link => !link.includes('/groups/') && !link.includes('/events/') && !link.includes('/public/') && !link.includes('/share.php'));

  // Extrai Emails
  const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  
  // Filtra e-mails sujos (falsos positivos dos motores)
  const dominiosBloqueados = ["duckduckgo.com", "sentry.io", "example.com", "w3.org", "sijax", "bing.com", "yahoo.com"];
  const emailValido = emailMatches.find(e => !dominiosBloqueados.some(d => e.toLowerCase().includes(d)));

  return {
    instagram: instagram ? (instagram.startsWith('http') ? instagram : `https://www.${instagram}`) : null,
    facebook: facebook ? (facebook.startsWith('http') ? facebook : `https://www.${facebook}`) : null,
    email: emailValido ? emailValido.toLowerCase() : null,
  };
}

export async function enrichLeadData(nome: string, cidade: string, uf: string = '') {
  const queryPadrao = `"${nome}" ${cidade} ${uf}`.trim();
  
  // Dispara buscas paralelas usando Dorks específicos para maximizar o resultado
  const [htmlYahoo, htmlBing, htmlDuck, htmlDuckBroad, htmlBingBroad] = await Promise.all([
    // Yahoo procura genérico por contatos
    searchYahoo(`${queryPadrao} contato email`),
    // Bing com dorks
    searchBing(`${queryPadrao} "@gmail.com" OR "@hotmail.com" OR "@yahoo.com"`),
    // DuckDuckGo focado em domínios oficiais
    searchDuckDuckGo(`${queryPadrao} site:instagram.com OR site:facebook.com`),
    // Busca ampla no DuckDuckGo (para achar Linktrees e diretórios que listam o insta deles)
    searchDuckDuckGo(`${nome} ${cidade} instagram perfil`),
    // Busca ampla no Bing
    searchBing(`${nome} ${cidade} instagram oficial`)
  ]);
  
  // Junta todo o código-fonte retornado pelas 5 varreduras
  const htmlUnificado = htmlYahoo + " " + htmlBing + " " + htmlDuck + " " + htmlDuckBroad + " " + htmlBingBroad;
  
  const links = extractSocialLinks(htmlUnificado);
  
  let fontesUsadas = [];
  if (htmlDuck.length > 0 || htmlDuckBroad.length > 0) fontesUsadas.push('DuckDuckGo');
  if (htmlYahoo.length > 0) fontesUsadas.push('Yahoo');
  if (htmlBing.length > 0 || htmlBingBroad.length > 0) fontesUsadas.push('Bing');
  
  return {
    instagram: links.instagram,
    facebook: links.facebook,
    email: links.email,
    fontes: fontesUsadas,
  };
}

export async function radarInstagram(nicho: string, cidade: string) {
  const query = `${nicho} ${cidade} site:instagram.com`.trim();
  
  const [htmlBing, htmlDuck, htmlYahoo] = await Promise.all([
    searchBing(query),
    searchDuckDuckGo(query),
    searchYahoo(query)
  ]);
  
  const htmlUnificado = htmlBing + " " + htmlDuck + " " + htmlYahoo;
  
  const instaMatches = htmlUnificado.match(/instagram\.com\/([A-Za-z0-9_.]+)/gi) || [];
  
  const ignorar = ['/p/', '/reel/', '/explore/', '/stories/', '/tags/', '/directory/', '/developer/', '/about/', '/legal/'];
  const usernames = new Set<string>();
  
  for (const match of instaMatches) {
    if (ignorar.some(i => match.includes(i))) continue;
    const parts = match.split('/');
    let user = parts[1]?.toLowerCase().trim();
    if (user && user.endsWith('.')) user = user.slice(0, -1);
    
    if (user && user.length > 2 && user !== "instagram" && user !== "p") {
      usernames.add(user);
    }
  }
  
  return Array.from(usernames).map(user => {
    const nomeFormatado = user.replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    return {
      osmId: "insta_" + user,
      nome: nomeFormatado,
      categoria: nicho || "Instagram",
      cidade: cidade || "Global",
      pais: "",
      telefone: null,
      website: null,
      email: null,
      instagram: `https://www.instagram.com/${user}`,
      fonte: "instagram",
      score: 50,
      nivel: "morno"
    };
  });
}
