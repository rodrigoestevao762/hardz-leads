import { createClient } from '@supabase/supabase-js';

// Função auxiliar para fazer o fetch com timeout e headers que disfarçam o bot
// Proxy via Google Translate para burlar os bloqueios de IP da Vercel
async function fetchHtml(url: string): Promise<string> {
  try {
    const proxyUrl = `https://translate.google.com/translate?sl=en&tl=es&u=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(6000)
    });
    return await res.text();
  } catch (err) {
    return '';
  }
}

async function searchDuckDuckGo(query: string): Promise<string> {
  return await fetchHtml(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
}

async function searchBing(query: string): Promise<string> {
  return await fetchHtml(`https://www.bing.com/search?q=${encodeURIComponent(query)}`);
}

async function searchYahoo(query: string): Promise<string> {
  return await fetchHtml(`https://search.yahoo.com/search?p=${encodeURIComponent(query)}`);
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
  
  // Filtra e-mails sujos (falsos positivos dos motores ou imagens)
  const dominiosBloqueados = [
    "duckduckgo", "sentry", "example", "w3.org", "sijax", "bing.com", "yahoo.com",
    "google.com", "microsoft.com", "facebook.com", "instagram.com", "twitter.com",
    "apple.com", "cloudflare.com", "ifood.com", "tripadvisor.com"
  ];
  const extensoesInvalidas = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js"];
  
  const emailValido = emailMatches.find(e => {
    const l = e.toLowerCase();
    // Rejeita se for arquivo de imagem ou script
    if (extensoesInvalidas.some(ext => l.endsWith(ext))) return false;
    // Rejeita domínios de motores ou corporações grandes
    if (dominiosBloqueados.some(d => l.includes(d))) return false;
    // Evita emails absurdamente grandes (falsos matches)
    if (l.length > 50) return false;
    return true;
  });

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
  // Limpa a palavra "mundial" ou vazia para não quebrar a busca
  const cid = (cidade.toLowerCase() === "mundial" || cidade.trim() === "") ? "" : cidade.trim();
  const nic = nicho.trim() || "empresa";
  
  const base = `${nic} ${cid}`.trim();
  
  // Nível Espião: 7 varreduras simultâneas com Dorks diferentes para extrair o máximo possível
  const [h1, h2, h3, h4, h5, h6, h7] = await Promise.all([
    searchDuckDuckGo(`${base} site:instagram.com`),
    searchDuckDuckGo(`${base} "instagram.com"`), // Sem site: para pegar menções
    searchDuckDuckGo(`${base} instagram oficial`),
    searchDuckDuckGo(`intitle:"${nic}" ${cid} site:instagram.com`),
    searchBing(`${base} site:instagram.com`),
    searchBing(`${base} instagram perfil`),
    searchYahoo(`${base} site:instagram.com`)
  ]);
  
  const htmlUnificado = h1 + " " + h2 + " " + h3 + " " + h4 + " " + h5 + " " + h6 + " " + h7;
  
  const instaMatches = htmlUnificado.match(/instagram\.com\/([A-Za-z0-9_.]+)/gi) || [];
  
  const ignorar = ['/p/', '/reel/', '/explore/', '/stories/', '/tags/', '/directory/', '/developer/', '/about/', '/legal/', '/web/'];
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
  
  // Limita a 100 resultados para não travar o navegador
  const listaFinal = Array.from(usernames).slice(0, 100);
  
  return listaFinal.map(user => {
    // Formata o nome para ficar bonito (ex: barbearia_do_ze -> Barbearia Do Ze)
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

export async function radarFoods(nicho: string, cidade: string) {
  const cid = (cidade.toLowerCase() === "mundial" || cidade.trim() === "") ? "" : cidade.trim();
  const nic = nicho.trim() || "restaurante";
  const base = `${nic} ${cid}`.trim();

  // Dorks focados nas maiores plataformas de delivery/turismo
  const [h1, h2, h3, h4, h5, h6] = await Promise.all([
    searchDuckDuckGo(`${base} site:ifood.com.br`),
    searchDuckDuckGo(`${base} site:ubereats.com`),
    searchBing(`${base} site:glovoapp.com`),
    searchBing(`${base} site:tripadvisor.com OR site:tripadvisor.com.br`),
    searchDuckDuckGo(`${base} site:rappi.com.br OR site:rappi.com`),
    searchYahoo(`${base} site:zomato.com OR site:just-eat.com`)
  ]);

  const htmlUnificado = h1 + " " + h2 + " " + h3 + " " + h4 + " " + h5 + " " + h6;

  // Regex para pegar URLs dos sites
  const urlsMatches = htmlUnificado.match(/https?:\/\/(www\.)?([a-zA-Z0-9.-]+)\/([^"'\s<]+)/gi) || [];

  const dominiosAlvo = ['ifood.com.br', 'ubereats.com', 'glovoapp.com', 'tripadvisor', 'rappi.com', 'zomato.com', 'just-eat.com'];
  
  const restaurantes = new Map<string, { nome: string; url: string; fonteStr: string }>();

  for (const link of urlsMatches) {
    if (!dominiosAlvo.some(d => link.includes(d))) continue;
    
    try {
      const urlObj = new URL(link);
      const dominio = urlObj.hostname.replace('www.', '');
      
      // Tentar extrair o nome baseado na estrutura da URL de cada app
      let nomeBruto = "";
      let path = urlObj.pathname;
      
      if (dominio.includes("ifood")) {
        // /delivery/cidade-uf/nome-do-restaurante/id
        const parts = path.split('/');
        nomeBruto = parts[3] || parts[2] || "";
      } else if (dominio.includes("tripadvisor")) {
        // /Restaurant_Review-gXXXX-dXXXX-Reviews-Nome_Restaurante.html
        const match = path.match(/-Reviews-([^-.]+)/);
        nomeBruto = match ? match[1] : path.split('-').pop()?.replace('.html', '') || "";
      } else if (dominio.includes("ubereats")) {
        // /store/nome-restaurante/id
        const parts = path.split('/');
        nomeBruto = parts.includes("store") ? parts[parts.indexOf("store") + 1] : "";
      } else {
        // Fallback genérico (pega o último path slug)
        const parts = path.split('/').filter(Boolean);
        nomeBruto = parts[parts.length - 1] || "";
      }
      
      if (!nomeBruto || nomeBruto.length < 3 || nomeBruto.includes("?")) continue;
      
      // Limpa nome
      const nomeLimpo = nomeBruto.replace(/[_-]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      const chave = nomeLimpo.toLowerCase();
      
      if (!restaurantes.has(chave)) {
        restaurantes.set(chave, {
          nome: nomeLimpo,
          url: link,
          fonteStr: dominio.split('.')[0]
        });
      }
    } catch {
      continue;
    }
  }

  const listaFinal = Array.from(restaurantes.values()).slice(0, 100);

  return listaFinal.map(r => ({
    osmId: `food_${r.fonteStr}_${r.nome.replace(/\s+/g, '')}`,
    nome: r.nome,
    categoria: nicho || "Restaurante",
    cidade: cidade || "Global",
    pais: "",
    telefone: null,
    website: r.url,
    email: null,
    instagram: null,
    fonte: r.fonteStr,
    score: 60,
    nivel: "morno"
  }));
}
