// Template de landing page — puro (sem dependências), usado no servidor e no editor.
// Todos os textos têm data-campo para edição inline no editor.

export type TextosLanding = {
  eyebrow: string;
  h1a: string;
  h1b: string;
  sub: string;
  servTitulo1: string;
  servTitulo2: string;
  expTitulo1: string;
  expTitulo2: string;
  expTexto: string;
  ctaEyebrow: string;
  ctaLinha1: string;
  ctaLinha2: string;
  ctaSub: string;
  rodape: string;
  servicos: { titulo: string; desc: string; preco: string }[];
  bullets: { titulo: string; desc: string }[];
};

export type DadosLanding = {
  nome: string;
  categoriaLabel: string;
  cidade: string;
  telefone: string | null;
  email: string | null;
  instagram: string | null;
  endereco: string | null;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const campo = (path: string, valor: string | null | undefined) =>
  valor ? `data-campo="${path}"` : "";

export function textosPadrao(d: DadosLanding): TextosLanding {
  const cat = d.categoriaLabel || "negócio local";
  return {
    eyebrow: `${cat.toUpperCase()} · ${(d.cidade || "").toUpperCase()}`,
    h1a: "O melhor da cidade",
    h1b: "começa aqui.",
    sub: `Na ${d.nome}, cada detalhe é pensado para você sair satisfeito. Atendimento de qualidade, ambiente acolhedor e profissionais que entendem do que fazem.`,
    servTitulo1: "Nossos",
    servTitulo2: "serviços",
    expTitulo1: "Mais do que um",
    expTitulo2: "atendimento.",
    expTexto: `A ${d.nome} nasceu para oferecer uma experiência diferente: aqui você é recebido pelo nome, atendido no horário e sai querendo voltar.`,
    ctaEyebrow: "Agende seu horário",
    ctaLinha1: "Sua próxima visita",
    ctaLinha2: "começa aqui.",
    ctaSub: "Chame no telefone, mande mensagem ou passe para conhecer. Estamos de portas abertas.",
    rodape: `© 2026 ${d.nome}`,
    servicos: [
      { titulo: "Atendimento completo", desc: "Tudo o que você precisa em um só lugar, com padrão de qualidade em cada detalhe.", preco: "sob consulta" },
      { titulo: "Atendimento express", desc: "Rápido, sem fila e sem abrir mão do capricho. Ideal para a correria do dia a dia.", preco: "sob consulta" },
      { titulo: "Atendimento premium", desc: "A experiência completa: mais tempo, mais cuidado e acabamento impecável.", preco: "sob consulta" },
      { titulo: "Pacote recorrente", desc: "Benefícios exclusivos para quem voltou e não pensa mais em trocar.", preco: "sob consulta" },
    ],
    bullets: [
      { titulo: "Marcação pontual", desc: "Chega, senta e é atendido na hora marcada." },
      { titulo: "Equipe fixa", desc: "Os mesmos profissionais, sempre o mesmo padrão." },
      { titulo: "Produtos de qualidade", desc: "Selecionados para o melhor resultado." },
    ],
  };
}

export function buildLandingHTML(
  d: DadosLanding,
  t: TextosLanding,
  accent: string,
  tema: "escuro" | "claro"
): string {
  const escuro = tema === "escuro";
  const brilho = (c: string) => {
    // clareia levemente a cor de destaque para hover
    return c;
  };
  const tel = d.telefone ? `tel:${d.telefone.replace(/[^\d+]/g, "")}` : "#";
  const telFmt = d.telefone || "";
  const mailto = d.email
    ? `mailto:${d.email}?subject=${encodeURIComponent("Contato — " + d.nome)}`
    : "#";
  const maps = `https://maps.google.com/?q=${encodeURIComponent(d.endereco || `${d.nome} ${d.cidade}`)}`;
  const insta = d.instagram
    ? `<a href="https://instagram.com/${d.instagram.replace("@", "")}" target="_blank" rel="noopener"><b>Instagram</b>${esc(d.instagram)}</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(d.nome)} | ${esc(d.categoriaLabel)} em ${esc(d.cidade)}</title>
<meta name="description" content="${esc(d.nome)} — ${esc(d.categoriaLabel)} em ${esc(d.cidade)}. ${esc(t.sub.slice(0, 120))}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600;9..144,700&family=Archivo:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --accent: ${accent};
    --accent-soft: ${accent}33;
    --bg: ${escuro ? "#1a1713" : "#faf6ee"};
    --bg2: ${escuro ? "#12100d" : "#f1ebdd"};
    --text: ${escuro ? "#f2ead9" : "#1c1914"};
    --dim: ${escuro ? "#b5ab97" : "#6b6353"};
    --faint: ${escuro ? "#5a5245" : "#9a917d"};
    --line: ${escuro ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"};
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Archivo', sans-serif; font-weight: 300; overflow-x: hidden; }
  ::selection { background: var(--accent); color: ${escuro ? "#12100d" : "#fff"}; }
  h1, h2, h3 { font-family: 'Fraunces', serif; }

  .topbar { display: flex; justify-content: space-between; align-items: center; padding: 24px 6vw; border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 10; background: ${escuro ? "rgba(26,23,19,0.92)" : "rgba(250,246,238,0.92)"}; backdrop-filter: blur(10px); }
  .logo { font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.15rem; }
  .logo em { color: var(--accent); font-style: normal; }
  .topbar nav { display: flex; gap: 34px; align-items: center; }
  .topbar nav a { color: var(--dim); text-decoration: none; font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; transition: color .3s; }
  .topbar nav a:hover { color: var(--accent); }
  .cta-top { color: ${escuro ? "#12100d" : "#fff"} !important; background: var(--accent); padding: 10px 22px; border-radius: 2px; font-weight: 600; }
  @media (max-width: 760px) { .topbar nav a:not(.cta-top) { display: none; } }

  .hero { min-height: 90vh; display: grid; place-items: center; text-align: center; position: relative; padding: 60px 6vw; background: radial-gradient(900px 500px at 50% -10%, var(--accent-soft), transparent 65%), linear-gradient(180deg, var(--bg), var(--bg2)); }
  .hero-frame { position: relative; padding: 64px 8vw; max-width: 880px; border: 1px solid var(--line); }
  .hero-frame::before, .hero-frame::after { content: ""; position: absolute; width: 34px; height: 34px; border: 1px solid var(--accent); }
  .hero-frame::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
  .hero-frame::after { bottom: -1px; right: -1px; border-left: none; border-top: none; }
  .eyebrow { font-size: 0.68rem; letter-spacing: 0.5em; text-transform: uppercase; color: var(--accent); margin-bottom: 26px; }
  .hero h1 { font-size: clamp(2.4rem, 7vw, 4.8rem); font-weight: 300; line-height: 1.08; }
  .hero h1 strong { font-weight: 600; color: var(--accent); }
  .hero p { margin-top: 24px; color: var(--dim); font-size: 1.02rem; line-height: 1.8; max-width: 540px; margin-inline: auto; }
  .hero-acoes { margin-top: 40px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn { display: inline-block; text-decoration: none; padding: 15px 32px; font-size: 0.74rem; letter-spacing: 0.24em; text-transform: uppercase; font-weight: 500; transition: all .3s; }
  .btn-accent { background: var(--accent); color: ${escuro ? "#12100d" : "#fff"}; }
  .btn-accent:hover { transform: translateY(-2px); filter: brightness(1.12); }
  .btn-linha { border: 1px solid var(--line); color: var(--text); }
  .btn-linha:hover { border-color: var(--accent); color: var(--accent); }
  .hero-meta { margin-top: 42px; display: flex; gap: 36px; justify-content: center; flex-wrap: wrap; color: var(--dim); font-size: 0.8rem; }
  .hero-meta b { color: var(--accent); font-weight: 500; }

  section { padding: 96px 6vw; }
  .cabeca { text-align: center; margin-bottom: 64px; }
  .cabeca h2 { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 400; }
  .cabeca h2 em { color: var(--accent); font-style: italic; }
  .cabeca .traco { width: 56px; height: 1px; background: var(--accent); margin: 22px auto 0; opacity: .7; }

  .servicos-secao { background: var(--bg2); }
  .grelha { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1px; background: var(--line); max-width: 1100px; margin: 0 auto; }
  .servico { background: var(--bg2); padding: 46px 32px; text-align: center; transition: background .35s; }
  .servico:hover { background: var(--accent-soft); }
  .servico .n { font-family: 'Fraunces', serif; color: var(--accent); font-size: .85rem; letter-spacing: .3em; }
  .servico h3 { margin: 16px 0 12px; font-size: 1.25rem; font-weight: 400; }
  .servico p { color: var(--dim); font-size: .9rem; line-height: 1.75; }
  .servico .preco { display: block; margin-top: 18px; color: var(--accent); font-family: 'Fraunces', serif; font-size: 1.05rem; }

  .exp { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; max-width: 1100px; margin: 0 auto; }
  @media (max-width: 860px) { .exp { grid-template-columns: 1fr; } }
  .exp-visual { aspect-ratio: 4/5; border: 1px solid var(--line); position: relative; background: radial-gradient(400px 300px at 30% 20%, var(--accent-soft), transparent 60%), linear-gradient(160deg, var(--bg), var(--bg2)); }
  .exp-visual .inicial { position: absolute; inset: 0; display: grid; place-items: center; font-family: 'Fraunces', serif; font-size: clamp(5rem, 11vw, 9rem); color: var(--accent); opacity: .3; font-style: italic; }
  .exp-visual .etiqueta { position: absolute; bottom: 24px; left: 24px; right: 24px; border-top: 1px solid var(--line); padding-top: 14px; font-size: .68rem; letter-spacing: .3em; text-transform: uppercase; color: var(--dim); }
  .exp-texto h2 { font-size: clamp(1.7rem, 3.5vw, 2.5rem); font-weight: 400; line-height: 1.25; }
  .exp-texto h2 em { color: var(--accent); font-style: italic; }
  .exp-texto > p { margin-top: 22px; color: var(--dim); line-height: 1.9; }
  .lista { margin-top: 32px; display: grid; gap: 16px; }
  .lista > div { display: flex; gap: 16px; align-items: baseline; }
  .lista .ponto { color: var(--accent); font-size: .8rem; }
  .lista b { font-weight: 500; }
  .lista span { color: var(--dim); font-size: .92rem; }

  .marcar { text-align: center; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: linear-gradient(180deg, var(--bg), var(--bg2)); }
  .marcar h2 { font-size: clamp(2rem, 5vw, 3.4rem); font-weight: 300; }
  .marcar h2 strong { color: var(--accent); font-weight: 600; }
  .marcar p { margin-top: 18px; color: var(--dim); }

  footer { padding: 64px 6vw 36px; text-align: center; }
  footer .logo { font-size: 1.35rem; }
  .contactos { margin-top: 28px; display: flex; justify-content: center; gap: 44px; flex-wrap: wrap; }
  .contactos a { color: var(--dim); text-decoration: none; font-size: .86rem; transition: color .3s; }
  .contactos a:hover { color: var(--accent); }
  .contactos b { display: block; color: var(--accent); font-size: .6rem; letter-spacing: .3em; text-transform: uppercase; margin-bottom: 8px; font-weight: 500; }
  .fim { margin-top: 44px; color: var(--faint); font-size: .68rem; letter-spacing: .2em; text-transform: uppercase; }
</style>
</head>
<body>

<div class="topbar">
  <div class="logo">${esc(d.nome)}</div>
  <nav>
    <a href="#servicos">${t.servTitulo1}</a>
    <a href="#experiencia">Experiência</a>
    <a href="#marcar" class="cta-top">${t.ctaEyebrow}</a>
  </nav>
</div>

<header class="hero">
  <div class="hero-frame">
    <p class="eyebrow" ${campo("eyebrow", t.eyebrow)}>${esc(t.eyebrow)}</p>
    <h1><span ${campo("h1a", t.h1a)}>${esc(t.h1a)}</span> <strong ${campo("h1b", t.h1b)}>${esc(t.h1b)}</strong></h1>
    <p ${campo("sub", t.sub)}>${esc(t.sub)}</p>
    <div class="hero-acoes">
      <a class="btn btn-accent" href="${tel}">Ligar${telFmt ? `: ${esc(telFmt)}` : ""}</a>
      <a class="btn btn-linha" href="#servicos">${t.servTitulo1} ${t.servTitulo2}</a>
    </div>
    <div class="hero-meta">
      ${d.endereco ? `<span><b>—</b> ${esc(d.endereco)}</span>` : ""}
      ${telFmt ? `<span><b>☎</b> ${esc(telFmt)}</span>` : ""}
    </div>
  </div>
</header>

<section class="servicos-secao" id="servicos">
  <div class="cabeca">
    <h2><span ${campo("servTitulo1", t.servTitulo1)}>${esc(t.servTitulo1)}</span> <em ${campo("servTitulo2", t.servTitulo2)}>${esc(t.servTitulo2)}</em></h2>
    <div class="traco"></div>
  </div>
  <div class="grelha">
    ${t.servicos.map((s, i) => `
    <div class="servico">
      <span class="n">0${i + 1}</span>
      <h3 ${campo(`servicos.${i}.titulo`, s.titulo)}>${esc(s.titulo)}</h3>
      <p ${campo(`servicos.${i}.desc`, s.desc)}>${esc(s.desc)}</p>
      <span class="preco" ${campo(`servicos.${i}.preco`, s.preco)}>${esc(s.preco)}</span>
    </div>`).join("")}
  </div>
</section>

<section id="experiencia">
  <div class="exp">
    <div class="exp-visual">
      <span class="inicial">${esc((d.nome || "A").replace(/[^A-Za-zÀ-ú]/g, "").charAt(0).toUpperCase() || "A")}</span>
      <span class="etiqueta">${esc(d.nome)} · ${esc(d.cidade)}</span>
    </div>
    <div class="exp-texto">
      <h2><span ${campo("expTitulo1", t.expTitulo1)}>${esc(t.expTitulo1)}</span> <em ${campo("expTitulo2", t.expTitulo2)}>${esc(t.expTitulo2)}</em></h2>
      <p ${campo("expTexto", t.expTexto)}>${esc(t.expTexto)}</p>
      <div class="lista">
        ${t.bullets.map((b, i) => `
        <div><span class="ponto">◆</span><div><b ${campo(`bullets.${i}.titulo`, b.titulo)}>${esc(b.titulo)}</b><br><span ${campo(`bullets.${i}.desc`, b.desc)}>${esc(b.desc)}</span></div></div>`).join("")}
      </div>
    </div>
  </div>
</section>

<section class="marcar" id="marcar">
  <p class="eyebrow" ${campo("ctaEyebrow", t.ctaEyebrow)}>${esc(t.ctaEyebrow)}</p>
  <h2><span ${campo("ctaLinha1", t.ctaLinha1)}>${esc(t.ctaLinha1)}</span> <strong ${campo("ctaLinha2", t.ctaLinha2)}>${esc(t.ctaLinha2)}</strong></h2>
  <p ${campo("ctaSub", t.ctaSub)}>${esc(t.ctaSub)}</p>
  <div class="hero-acoes">
    <a class="btn btn-accent" href="${tel}">Ligar${telFmt ? `: ${esc(telFmt)}` : ""}</a>
    ${d.email ? `<a class="btn btn-linha" href="${mailto}">E-mail</a>` : ""}
  </div>
</section>

<footer>
  <div class="logo">${esc(d.nome)}</div>
  <div class="contactos">
    ${telFmt ? `<a href="${tel}"><b>Telefone</b>${esc(telFmt)}</a>` : ""}
    ${d.email ? `<a href="${mailto}"><b>E-mail</b>${esc(d.email)}</a>` : ""}
    ${insta}
    <a href="${maps}" target="_blank" rel="noopener"><b>Endereço</b>${esc(d.endereco || d.cidade)}</a>
  </div>
  <p class="fim" ${campo("rodape", t.rodape)}>${esc(t.rodape)}</p>
</footer>

</body>
</html>`;
}
