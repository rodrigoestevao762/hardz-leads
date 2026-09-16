import { createClient } from '@supabase/supabase-js';

// Função para buscar dados em páginas web
async function searchWeb(query: string): Promise<string> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = await res.text();
    return html;
  } catch (err) {
    console.error('Erro na busca web:', err);
    return '';
  }
}

function extractSocialLinks(html: string) {
  const instagramMatch = html.match(/https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+/i);
  const facebookMatch = html.match(/https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.-]+/i);
  const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  
  return {
    instagram: instagramMatch ? instagramMatch[0] : null,
    facebook: facebookMatch ? facebookMatch[0] : null,
    email: emailMatch ? emailMatch[0] : null,
  };
}

export async function enrichLeadData(nome: string, cidade: string, uf: string = '') {
  const query = `"${nome}" ${cidade} ${uf} instagram facebook contato`;
  const html = await searchWeb(query);
  
  const links = extractSocialLinks(html);
  
  return {
    instagram: links.instagram,
    facebook: links.facebook,
    email: links.email,
    fontes: ['DuckDuckGo Busca'],
  };
}

