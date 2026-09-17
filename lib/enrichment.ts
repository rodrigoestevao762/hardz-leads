import { createClient } from '@supabase/supabase-js';

// Função auxiliar para fazer o fetch com timeout e headers que disfarçam o bot
async function fetchHtml(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
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

const usernamesBloqueados = [
  "p", "reel", "explore", "stories", "tags", "developer", "about", "legal", "directory",
  "qwantcom", "duckduckgo", "yahoo", "bing", "google", "microsoft", "apple", "facebook",
  "instagram", "twitter", "tripadvisor", "ifood", "ifoodbrasil", "ubereats", "rappi", "zomato",
  "just-eat", "glovoapp", "cloudflare", "sentry", "web"
];

function extractSocialLinks(html: string) {
  // Extrai Instagram (ignorando posts/reels/etc e contas corporativas)
  const instaMatches = html.match(/instagram\.com\/([A-Za-z0-9_.]+)/gi) || [];
  const instagram = instaMatches.find(link => {
    const user = link.split('/')[1]?.toLowerCase().split('?')[0];
    return user && !usernamesBloqueados.includes(user);
  });

  // Extrai Facebook
  const fbMatches = html.match(/facebook\.com\/([A-Za-z0-9_.-]+)/gi) || [];
  const facebook = fbMatches.find(link => {
    const user = link.split('/')[1]?.toLowerCase().split('?')[0];
    const invalidFbPaths = ['groups', 'events', 'public', 'share.php', 'profile.php'];
    return user && !usernamesBloqueados.includes(user) && !invalidFbPaths.includes(user);
  });

  // Extrai Emails
  // Remove lixo URL-encoded que os motores de busca geram (%22, %2B, %20)
  const htmlLimpo = html.replace(/%22/g, '"').replace(/%2B/ig, '+').replace(/%40/ig, '@').replace(/%20/g, ' ');
  
  // Regex RESTRETO: removemos o '+' do prefixo. O '+' é o caractere de 'espaço' em URLs, 
  // o que causava a captura de buscas inteiras tipo '22+roma+@gmail.com'
  const emailMatches = htmlLimpo.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  
  // Filtra e-mails sujos (falsos positivos dos motores ou imagens)
  const dominiosBloqueados = [
    "duckduckgo", "sentry", "example", "w3.org", "sijax", "bing.com", "yahoo.com",
    "google.com", "microsoft.com", "facebook.com", "instagram.com", "twitter.com",
    "apple.com", "cloudflare.com", "ifood.com", "tripadvisor.com", "tiktok.com",
    "linkedin.com", "amazon.com", "qwant.com"
  ];
  const extensoesInvalidas = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js"];
  
  const emailValido = emailMatches.find(e => {
    const l = e.toLowerCase();
    // Rejeita se for arquivo de imagem ou script
    if (extensoesInvalidas.some(ext => l.endsWith(ext))) return false;
    // Rejeita domínios de motores ou corporações grandes
    if (dominiosBloqueados.some(d => l.includes(d))) return false;
    // Evita emails absurdamente grandes (falsos matches)
    if (l.length > 40) return false;
    // Rejeita emails falsos gerados por dorks url-encoded
    if (l.includes('+or+') || l.includes('22@')) return false;
    // Rejeita se começar com caracteres estranhos
    if (l.startsWith('-') || l.startsWith('.')) return false;
    return true;
  });

  return {
    instagram: instagram ? (instagram.startsWith('http') ? instagram : `https://www.${instagram}`) : null,
    facebook: facebook ? (facebook.startsWith('http') ? facebook : `https://www.${facebook}`) : null,
    email: emailValido ? emailValido.toLowerCase() : null,
  };
}

// Novos Motores
async function searchQwant(query: string): Promise<string> {
  return await fetchHtml(`https://lite.qwant.com/?q=${encodeURIComponent(query)}`);
}

async function searchBrave(query: string): Promise<string> {
  return await fetchHtml(`https://search.brave.com/search?q=${encodeURIComponent(query)}`);
}

async function searchAsk(query: string): Promise<string> {
  return await fetchHtml(`https://www.ask.com/web?q=${encodeURIComponent(query)}`);
}

async function searchEcosia(query: string): Promise<string> {
  return await fetchHtml(`https://www.ecosia.org/search?q=${encodeURIComponent(query)}`);
}

export async function enrichLeadData(nome: string, cidade: string, uf: string = '') {
  // Dispara buscas paralelas em 7 motores diferentes
  const safeNome = nome.replace(/"/g, '').replace(/[()]/g, ''); // limpa pontuação complexa
  const urlNome = safeNome.replace(/\s+/g, '').toLowerCase();

  // Removemos os parênteses (OR) complexos que estavam quebrando as engines HTML
  const [htmlYahoo, htmlBing, htmlDuck, htmlQwant, htmlBrave, htmlAsk, htmlEcosia] = await Promise.all([
    searchYahoo(`"${safeNome}" contato email ${cidade} ${uf}`),
    searchBing(`"${safeNome}" ${cidade} @gmail.com`),
    searchDuckDuckGo(`site:instagram.com "${safeNome}" ${cidade}`),
    searchQwant(`site:facebook.com "${safeNome}" ${cidade}`),
    searchBrave(`"${safeNome}" ${cidade} email contato`),
    searchAsk(`"${safeNome}" ${cidade} instagram facebook email`),
    searchEcosia(`"${safeNome}" ${cidade} contato`)
  ]);
  
  const htmlUnificado = htmlYahoo + " " + htmlBing + " " + htmlDuck + " " + htmlQwant + " " + htmlBrave + " " + htmlAsk + " " + htmlEcosia;
  
  const links = extractSocialLinks(htmlUnificado);
  
  let fontesUsadas = [];
  if (htmlDuck.length > 0) fontesUsadas.push('DuckDuckGo');
  if (htmlYahoo.length > 0) fontesUsadas.push('Yahoo');
  if (htmlBing.length > 0) fontesUsadas.push('Bing');
  if (htmlQwant.length > 0) fontesUsadas.push('Qwant');
  if (htmlBrave.length > 0) fontesUsadas.push('Brave');
  if (htmlAsk.length > 0) fontesUsadas.push('Ask');
  if (htmlEcosia.length > 0) fontesUsadas.push('Ecosia');
  
  return {
    instagram: links.instagram,
    facebook: links.facebook,
    email: links.email,
    fontes: fontesUsadas,
  };
}

import { geocodificar, buscarEmpresas } from './overpass';

export async function radarInstagram(nicho: string, cidade: string) {
  const cid = (cidade.toLowerCase() === "mundial" || cidade.trim() === "") ? "" : cidade.trim();
  const nic = nicho.trim() || "empresa";
  
  const nicExpanded = nic.toLowerCase().includes("clínica") ? `${nic} clinic` : 
                      nic.toLowerCase().includes("advogado") ? `${nic} lawyer` : 
                      nic.toLowerCase().includes("restaurante") ? `${nic} restaurant` : 
                      nic.toLowerCase().includes("loja") ? `${nic} store` : 
                      nic.toLowerCase().includes("estética") ? `${nic} spa` : nic;

  // Usa Geocodificação + Overpass (Extremamente rápido e varre milhares de comércios)
  const geo = await geocodificar(cid);
  if (geo) {
    const emp = await buscarEmpresas(
      "all",
      [`name~${nicExpanded.split(' ')[0]}`], // Busca qualquer coisa relacionada ao nicho
      geo.lat,
      geo.lng,
      geo.radiusM,
      cid,
      geo.paisNome
    );
    // Para manter a assinatura, convertemos para o formato do radar
    return emp.map(e => ({
      osmId: e.osmId,
      nome: e.nome,
      categoria: nicho || "Instagram",
      cidade: cidade || "Global",
      pais: e.pais || "",
      telefone: e.telefone || null,
      website: e.website || null,
      email: e.email || null,
      instagram: e.instagram || null,
      fonte: "overpass",
      score: 50,
      nivel: "morno"
    }));
  }

  // Fallback para OSINT se a cidade não for encontrada
  const base = `${nicExpanded} ${cid}`.trim();
  const baseComAspas = `${nicExpanded} ${cid ? `"${cid}"` : ""}`.trim();
  
  // Scrapes simples focados no instagram para garantir extração maciça
  const [h1, h2, h3, h4, h5, h6, h7] = await Promise.all([
    searchDuckDuckGo(`${baseComAspas} "instagram.com"`),
    searchBing(`${baseComAspas} instagram`),
    searchYahoo(`${baseComAspas} instagram oficial`),
    searchQwant(`${base} instagram profile`),
    searchBrave(`${base} instagram.com`),
    searchAsk(`${base} instagram page`),
    searchEcosia(`${base} instagram.com`)
  ]);
  
  const htmlUnificado = h1 + " " + h2 + " " + h3 + " " + h4 + " " + h5 + " " + h6 + " " + h7;
  
  const instaMatches = htmlUnificado.match(/instagram\.com\/([A-Za-z0-9_.]+)/gi) || [];
  
  const usernames = new Set<string>();
  
  const usernamesBloqueados = [
    "tripadvisor", "ifood", "ifoodbrasil", "ubereats", "rappi", "zomato", "facebook", "duckduckgo", 
    "google", "qwantcom", "yahoo", "bing", "explore", "p", "reel", "reels", "stories", "tags", "about", 
    "developer", "tv", "help", "legal", "privacy", "terms", "directory", "profiles", "locations", "search"
  ];
  
  for (const match of instaMatches) {
    const parts = match.split('/');
    let user = parts[1]?.toLowerCase().trim().split('?')[0];
    if (user && user.endsWith('.')) user = user.slice(0, -1);
    
    // Ignorar urls de visualização de mídia ou internos do insta
    if (!user || user.length < 3 || usernamesBloqueados.includes(user)) continue;
    usernames.add(user);
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
  
  const nicExpanded = nic.toLowerCase().includes("restaurante") ? `${nic} restaurant` : 
                      nic.toLowerCase().includes("hamburgueria") ? `${nic} burger` : 
                      nic.toLowerCase().includes("pizzaria") ? `${nic} pizzeria` : nic;

  // Busca Massiva via Overpass API primeiro (Milhares de restaurantes globais)
  const geo = await geocodificar(cid);
  if (geo) {
    const emp = await buscarEmpresas(
      "food",
      ["amenity~restaurant|fast_food|cafe|bar", "shop~bakery|pastry", `name~${nicExpanded.split(' ')[0]}`], 
      geo.lat,
      geo.lng,
      geo.radiusM,
      cid,
      geo.paisNome
    );
    // Transforma a saída do mapa na saída de leads (mesmo que não tenha iFood ainda, o usuário enriquece)
    return emp.map(e => ({
      osmId: e.osmId,
      nome: e.nome,
      categoria: "Restaurante/Delivery",
      cidade: e.cidade || cidade,
      pais: e.pais || "",
      telefone: e.telefone || null,
      website: e.website || null,
      email: e.email || null,
      instagram: e.instagram || null,
      fonte: "overpass_foods",
      score: 70,
      nivel: "quente"
    }));
  }

  // Fallback para OSINT se falhar
  const base = `${nicExpanded} ${cid}`.trim();
  const baseComAspas = `${nicExpanded} ${cid ? `"${cid}"` : ""}`.trim();

  // Caça em apps de delivery globais de forma simples usando a força bruta de palavras-chave
  const [h1, h2, h3, h4, h5, h6, h7] = await Promise.all([
    searchDuckDuckGo(`${baseComAspas} ifood OR ubereats`),
    searchBing(`${baseComAspas} tripadvisor OR yelp`),
    searchYahoo(`${baseComAspas} doordash OR grubhub`),
    searchQwant(`${base} rappi OR zomato`),
    searchBrave(`${base} just-eat OR deliveroo`),
    searchAsk(`${base} restaurant menu delivery ifood`),
    searchEcosia(`${base} ifood tripadvisor ubereats yelp`)
  ]);

  const htmlUnificado = h1 + " " + h2 + " " + h3 + " " + h4 + " " + h5 + " " + h6 + " " + h7;

  // Regex para pegar URLs dos sites
  const urlsMatches = htmlUnificado.match(/https?:\/\/(www\.)?([a-zA-Z0-9.-]+)\/([^"'\s<]+)/gi) || [];

  const dominiosAlvo = ['ifood', 'ubereats', 'glovoapp', 'tripadvisor', 'rappi', 'zomato', 'just-eat', 'doordash', 'deliveroo', 'grubhub', 'yelp'];
  
  const restaurantes = new Map<string, { nome: string; url: string; fonteStr: string }>();

  for (let link of urlsMatches) {
    try {
      const urlObj = new URL(link);
      const dominio = urlObj.hostname.replace('www.', '');
      
      if (!dominiosAlvo.some(d => dominio.includes(d))) continue;
      
      let nomeBruto = "";
      let path = urlObj.pathname;
      
      if (dominio.includes("ifood")) {
        const parts = path.split('/');
        nomeBruto = parts[3] || parts[2] || "";
      } else if (dominio.includes("tripadvisor")) {
        const match = path.match(/-Reviews-([^-.]+)/);
        nomeBruto = match ? match[1] : path.split('-').pop()?.replace('.html', '') || "";
      } else if (dominio.includes("ubereats")) {
        const parts = path.split('/');
        nomeBruto = parts.includes("store") ? parts[parts.indexOf("store") + 1] : "";
      } else {
        const parts = path.split('/').filter(Boolean);
        nomeBruto = parts[parts.length - 1] || "";
      }
      
      if (!nomeBruto || nomeBruto.length < 3 || nomeBruto.includes("?")) continue;
      
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

  return Array.from(restaurantes.values()).map(r => ({
    osmId: `food_${r.fonteStr}_${r.nome.replace(/\s+/g, '')}`,
    nome: r.nome,
    categoria: 'Restaurante',
    cidade: cid,
    pais: "",
    telefone: null,
    website: r.url,
    email: null,
    instagram: null,
    fonte: r.fonteStr,
    score: 60,
    nivel: "morno" as const
  }));
}
