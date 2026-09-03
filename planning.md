# Plano de Melhorias — Jornal Santista

> Foco: melhor experiência de leitura para um site jornalístico + qualidade de
> frontend (SEO, performance, acessibilidade, manutenção).
>
> Método: mudanças **em etapas pequenas e verificáveis**. Cada fase termina com
> `npm run build` limpo e teste manual das telas afetadas. Não quebrar o que já
> funciona. Marcar `[x]` conforme concluído e registrar no fim do arquivo.

---

## Estado atual (levantamento)

Stack: React 19 + Vite 6 + React Router 6 + Supabase + Bootstrap 5 + Tiptap (admin).
Deploy: Vercel (SPA, rewrite tudo para `index.html`).

### Bugs / dívidas encontrados

| # | Problema | Arquivo(s) | Gravidade |
|---|----------|-----------|-----------|
| B1 | `MetaTags.jsx` com encoding quebrado — `<title>`/`description` default saem com caracteres corrompidos (`M�dia`, `den�ncias`) | `src/components/MetaTags.jsx` | Alta |
| B2 | `class=` em vez de `className=` no `Noticia.jsx` (linhas ~476-477) → a coluna de leitura `col-lg-8` **não é aplicada**, texto ocupa largura total | `src/pages/Noticia.jsx` | Alta |
| B3 | `Categorias.jsx` e `Sobre.jsx` buscam `/blog_posts.json` (arquivo estático inexistente, não há pasta `public/`) → **as duas páginas estão quebradas / vazias** | `src/pages/Categorias.jsx`, `src/pages/Sobre.jsx` | Alta |
| B4 | Modal de newsletter aponta o `form action` para `theintercept.us11.list-manage.com` → assinantes vão para a lista do The Intercept, não do jornal | `src/components/NewsletterModal.jsx` | Alta |
| B5 | Sem rota `*` (404) → URL desconhecida renderiza página em branco | `src/App.jsx` | Média |
| B6 | Sem pasta `public/` → favicon (`/vite.svg`), OG default (`/js.webp`), fotos de autores (`/darlene.jpeg`, `/DSC00192-EDIT(1).jpg`) dão 404 | raiz | Média |
| B7 | `dangerouslySetInnerHTML` sem sanitização (conteúdo vem do editor) → risco XSS | `Noticia.jsx`, `Sobre.jsx` | Média |
| B8 | `console.log` de debug em produção espalhados | `lib/supabase.js`, `lib/postsService.js`, `pages/Noticia.jsx` | Baixa |
| B9 | Contador `noticias_lidas` no `localStorage` incrementa em todo mount (e 2x no StrictMode); gate "assine para continuar lendo" agressivo para jornal local | `pages/Noticia.jsx` | Média |
| B10 | Parsing de `images` (string JSON vs array) duplicado em 4+ lugares | `PostItem.jsx`, `Noticia.jsx`, `postsService.js` | Baixa |
| B11 | Layout `Header/main/Footer` copiado em 6 rotas | `src/App.jsx` | Baixa |
| B12 | `getPostById` na verdade recebe slug; nome enganoso | `lib/postsService.js` | Baixa |
| B13 | `ArticleHeader.jsx` importa `prop-types` (não está no `package.json`) — componente morto | `src/components/ArticleHeader.jsx` | Baixa |
| B14 | E-mail de contato inconsistente (`contato@jornalsantista.org` no Header/Footer vs `.com.br` no Contato) | vários | Baixa |
| B15 | `Contato.jsx` sem `<MetaTags>`; nenhuma página além de Home/Noticia tem meta tags | páginas | Média |
| B16 | Busca 100% client-side sobre todos os posts; sem página de resultados dedicada | `pages/Home.jsx` | Média |
| B17 | `getAllPosts()` traz todos os posts com `content` completo, sem paginação | `lib/postsService.js`, `lib/supabase.js` | Média |
| B18 | Sem `robots.txt`, `sitemap.xml`, feed RSS, JSON-LD, `<link rel=canonical>` | infra | Média |
| B19 | Menu lateral sem `role=dialog`, sem focar/trap, sem fechar com `Esc` | `components/Header.jsx` | Média |
| B20 | Imagens sem `width`/`height` → CLS; hero (LCP) com `loading=lazy` | `PostItem.jsx`, `Noticia.jsx` | Média |

---

## Princípios de execução

1. Uma fase = um conjunto coeso de mudanças + build verde + commit.
2. Não alterar o admin (`src/admin/**`) salvo quando a fase disser explicitamente.
3. Preservar rotas e slugs existentes (SEO / links já compartilhados).
4. Sem novas dependências pesadas sem necessidade; anotar cada uma adicionada.
5. Português no código/UI, como o resto do projeto.

---

## Fase 1 — Correções de bugs (sem mudança visual grande)

**Objetivo:** deixar o site inteiro funcional. Risco baixo, retorno alto.

- [x] **1.1** Reescrever `MetaTags.jsx` em UTF-8 com textos corretos (B1)
- [x] **1.2** Corrigir `class` → `className` e revisar o grid da coluna de leitura em `Noticia.jsx` (B2)
- [x] **1.3** Criar pasta `public/` com `favicon` real, `robots.txt` e imagem OG default; ajustar `index.html` (B6, parte de B18)
- [x] **1.4** Migrar `Sobre.jsx` para Supabase (ou conteúdo estático definitivo) — remover `blog_posts.json` (B3)
- [x] **1.5** Migrar `Categorias.jsx` para Supabase usando `getAllPosts` / `getPostsByCategory` — remover `blog_posts.json` (B3)
- [x] **1.6** Adicionar rota `*` → página 404 amigável com link para Home e busca (B5)
- [x] **1.7** Corrigir/!desativar o `form action` do `NewsletterModal` (usar lista correta ou remover o envio até haver lista) (B4)
- [x] **1.8** Unificar e-mail de contato do jornal em um só lugar (`src/config/site.js`) (B14)
- [~] **1.9** `npm run build` verde ✅ + Vite transforma todos os módulos ✅.
  Teste manual visual **pendente**: requer `.env` real (Supabase) e ambiente com
  navegador. Rodar: Home, Notícia, Categorias (`/categorias` e `/categorias/:cat`),
  Sobre, Contato, URL inexistente.

**Validação:** navegar em todas as rotas públicas sem erro no console; link preview
(og:title) correto ao inspecionar o HTML renderizado.

---

## Fase 2 — Higiene de código

**Objetivo:** reduzir ruído e duplicação; base limpa para as próximas fases.

- [x] **2.1** `PublicLayout` com `<Outlet/>` — remover repetição de Header/main/Footer no `App.jsx` (B11)
- [x] **2.2** Centralizar normalização de `images` em `postsService` (retornar sempre `string[]`); remover parsing dos componentes (B10)
- [x] **2.3** Remover/silenciar `console.log` de debug (manter `console.error` úteis atrás de `import.meta.env.DEV`) (B8)
- [x] **2.4** Renomear `getPostById` → `getPostBySlugOrId` e ajustar chamadas (B12)
- [x] **2.5** Remover `ArticleHeader.jsx` e `SearchBar.jsx` se não usados, ou integrá-los (B13)
- [x] **2.6** Extrair helper `resolvePostImages` + placeholder SVG para um único módulo
- [x] **2.7** Adicionar `dompurify` (`src/lib/sanitize.js`) e sanitizar o HTML do artigo em `Noticia.jsx` (B7) — _nova dep_. `Sobre.jsx` virou estático na Fase 1, sem `dangerouslySetInnerHTML`.
- [x] **2.9** Remover deps mortas `jsonwebtoken` e `bcryptjs` (resquício do login client-side antigo; nenhum import no código)
- [~] **2.8** `npm run build` verde ✅ (142 módulos). Bundle JS +10 kB gzip (DOMPurify) — será mitigado na 4.7 (code splitting do admin). Smoke test visual pendente (mesmo bloqueio da 1.9).

---

## Fase 3 — SEO e compartilhamento

**Objetivo:** aparecer bem no Google/Google News e em links de WhatsApp/Facebook.

- [x] **3.1** `<MetaTags>` em todas as páginas públicas — Contato ganhou; Home/Sobre/Categorias/404 já tinham. Título/descrição da Home padronizados.
- [x] **3.2** `<link rel="canonical">` — emitido pelo `MetaTags` a partir do `url`; todas as páginas passam `window.location.href`.
- [x] **3.3** JSON-LD (`src/components/JsonLd.jsx` + `src/lib/structuredData.js`): `NewsMediaOrganization` + `WebSite`/`SearchAction` na Home; `NewsArticle` + `BreadcrumbList` na notícia.
- [x] **3.4** `sitemap.xml` — função serverless `api/sitemap.js` (lê `posts` do Supabase) + rewrite em `vercel.json`; `robots.txt` já aponta para ele. Corrigido também o header de cache (`/static/` → `/assets/`, que é o dir real do Vite).
- [x] **3.5** Feed RSS 2.0 — `api/feed.js` (30 posts) + rewrite; `<link rel="alternate">` no `index.html`.
- [x] **3.6** **Decisão: opção (b)** — hoje o JSON-LD/meta são injetados no cliente; para os previews de link (WhatsApp/Facebook, que não rodam JS) a rota `/noticia/:slug` precisa de HTML server-rendered. Caminho escolhido: **função serverless/Edge Middleware na Vercel** que intercepta `/noticia/:slug`, busca o post e injeta `<title>`/OG/JSON-LD no HTML antes de servir — sem reescrever o app. `vite-react-ssg` fica como plano B; migração para Astro só se o volume editorial crescer muito. **Abre a Fase 9** (implementação do middleware + exportar `og-default.png` raster).
- [~] **3.7** Validação com Rich Results Test / Facebook Sharing Debugger / `curl /sitemap.xml` e `/feed.xml` — **pendente**: precisa do deploy no ar e das env vars do Supabase disponíveis às funções no projeto Vercel.

---

## Fase 4 — Performance

**Objetivo:** carregamento rápido no 3G/celular (público de jornal local é mobile).

- [x] **4.1** `postsAPI.getPostsPage({page,pageSize})` com `.range()`; `searchPosts`; `getCategoryNames` (só a coluna `categories`); `getPostsByCategory` agora filtra no servidor (`.contains`). `getAllPosts` (completo) fica só para o admin.
  ⚠️ **Regressão corrigida (6cff845):** a 1ª versão usava `.select('*', { count: 'exact' })`. Com 0 linhas visíveis ao `anon`, o PostgREST devolve `416/PGRST103` para qualquer `range`, virando erro duro na Home. Trocado por "buscar `pageSize+1` linhas → `hasMore`", sem `count`.
- [x] **4.2** Home paginada (12/página) com botão "Carregar mais"; estados loading/erro/vazio distintos; `section-label` virou `<h2>`. Busca client-side removida da Home.
- [x] **4.3** Página dedicada `/busca?q=` (`src/pages/Busca.jsx`) com busca server-side (`ilike` em title/excerpt/author), "carregar mais" e estado "nada encontrado". Header aponta para `/busca`. _Busca no corpo do texto e destaque de termos: fase futura (índice full-text)._
- [x] **4.4** 3 `@import` em cascata → 1 `<link>` combinado com `display=swap` no `index.html` (preconnect já existia).
- [~] **4.5** Ícones: **adiado**. `@tiptap/*` (9 pacotes) removido — não era importado em lugar nenhum. Unificar `react-icons`/`bootstrap-icons` fica para depois (font fica em cache após o 1º load; ganho pequeno vs. risco).
- [~] **4.6** Feito: hero da notícia sem `lazy` + `fetchPriority="high"` + `width/height`; `decoding="async"` em todas as imagens; card `hero` do feed com `loading="eager"`. **Pendente:** `srcset`/`sizes` e transforms do Supabase Storage (transform exige plano Pro — validar antes).
- [~] **4.7** `React.lazy` no admin → **revertido (b0f7f68)**: a área `/admin` parou de abrir em produção (provável falha ao baixar os chunks dinâmicos na Vercel). Ganho era pequeno (−9 kB gzip). Voltou para import estático. Fica para reavaliar com Error Boundary + retry de chunk numa fase futura.
- [~] **4.8** Lighthouse antes/depois — **pendente** (precisa do site no ar).

---

## Fase 5 — Experiência de leitura (página de notícia)

**Objetivo:** a tela mais importante do site.

Referência de estilo (fornecida pelo usuário): página de matéria do Intercept
Brasil — hero de imagem cheia com kicker + título sobre gradiente escuro, corpo
em serifa grande (`Newsreader`), coluna estreita, trilha de compartilhamento.

- [x] **5.1** `.article-content` reescrito: sem `justify`, sem `pre-wrap`, coluna de leitura `max-width: 720px`.
- [x] **5.2** Tipografia: corpo em **Newsreader** (Google Fonts, opsz 6..72) ~1.27rem / 1.75; títulos internos em Archivo; links, citações e legendas revisados.
- [x] **5.3** `<time dateTime>` com ISO + formato "27 de ago de 2026, 17h30". _(Data relativa "há X horas" fica para depois.)_
- [x] **5.4** Tempo estimado de leitura (200 wpm sobre o texto sem HTML).
- [x] **5.5** Barra de progresso de leitura fixa no topo (`.reading-progress`).
- [x] **5.6** Avatar e link de perfil dos autores vêm da tabela `authors` do Supabase (`getAuthorProfiles` com `.in('name', …)`); o mapa local `AUTHOR_BIOS`/`getAuthorImage` fica só como fallback. Nome do autor vira link para `profile_url` quando existe. _Bio ainda no código: a tabela `authors` não tem coluna `bio` (só `name`, `avatar_url`, `profile_url`)._
- [x] **5.7** Bloco "Leia também" ao final da matéria: `getRelatedPosts({category, excludeSlug})` — mesma editoria primeiro, completado com as mais recentes; renderiza `PostItem`. Some se não houver relacionadas.
- [x] **5.8** Compartilhar: WhatsApp / Facebook / X / copiar link, com `aria-label`; trilha vertical sticky no desktop, linha horizontal no mobile. _(`navigator.share` nativo: pendente.)_
- [x] **5.9** Breadcrumb no topo da coluna (desktop + mobile); removido o breadcrumb duplicado do rodapé mobile. JSON-LD `BreadcrumbList` já vinha da Fase 3.
- [x] **5.10** Newsletter: modal bloqueante → `NewsletterBar` (faixa fixa no rodapé, dispensável, com snooze de 30 dias em `localStorage`). `NewsletterModal.jsx` removido.
- [x] **hero** — imagem de destaque agora ocupa a largura toda (`min(72vh,760px)`), com kicker + `<h1>` sobre o gradiente; sem imagem, cai num header simples.

---

## Fase 6 — Navegação e arquitetura de informação

- [ ] **6.1** Editorias no header (Cidade, Política, Cultura, …) a partir das categorias reais
- [ ] **6.2** Header: nomes consistentes (hoje `/categorias` aparece como "Artigos")
- [ ] **6.3** Footer com mapa do site, expediente, política editorial, link do RSS
- [ ] **6.4** Menu lateral acessível: `role="dialog"`, foco preso, `Esc` fecha, devolve foco ao botão (B19)
- [ ] **6.5** Skeletons no lugar do `spinner-border`
- [ ] **6.6** Estados de erro distintos de "vazio" (botão "tentar novamente") na Home e Categorias

---

## Fase 7 — Acessibilidade

- [ ] **7.1** "Pular para o conteúdo" (skip link)
- [ ] **7.2** `section-label` ("Destaques", "Últimas notícias") como `<h2>`
- [ ] **7.3** `aria-label` em todos os botões só-ícone
- [ ] **7.4** Contraste do accent `#6653ff` sobre branco — validar AA e ajustar se preciso
- [ ] **7.5** Foco visível consistente; navegação por teclado no menu e nos cards
- [ ] **7.6** `alt` significativo nas imagens; dimensões para evitar CLS (liga com 4.6)
- [ ] **7.7** Auditoria com axe / Lighthouse a11y

---

## Fase 8 — PWA e infraestrutura

- [ ] **8.1** `manifest.webmanifest` + ícones (maskable), `theme-color`
- [ ] **8.2** Analytics leve e sem cookies (Plausible/Umami) — para saber o que é lido
- [ ] **8.3** Cache headers na Vercel para assets versionados
- [ ] **8.4** (Opcional) Service worker só para shell/offline básico
- [ ] **8.5** Executar a decisão da 3.6 (SSR/prerender) se aprovada

---

## Fase 9 — HTML server-rendered para previews de link (decisão 3.6)

**Objetivo:** WhatsApp/Facebook/Twitter mostram título, descrição e imagem
corretos ao compartilhar uma notícia (crawlers desses previews não executam JS).

- [x] **9.1** `middleware.js` (Edge Middleware da Vercel, `matcher: /noticia/:slug*`):
  detecta crawler pelo `User-Agent` (WhatsApp, facebookexternalhit, Twitterbot,
  Telegram, Googlebot, LinkedIn, Slack, …); busca o post via REST do Supabase
  (por slug, com fallback por id numérico); injeta `<title>`, OG/Twitter e o
  JSON-LD `NewsArticle` no `index.html` e devolve com `s-maxage=600`.
  Humano → `return` vazio, SPA normal sem overhead.
- [x] **9.2** `public/og-default.png` (1200×630) gerado; `MetaTags.jsx` e o
  middleware apontam para ele. `MetaTags` agora resolve `og:image` para URL absoluta.
- [x] **9.3** OG image por notícia: 1ª imagem do post (`firstImage()` normaliza
  array/JSON/caminho relativo); sem imagem → `og-default.png`.
- [ ] **9.4** Testar no Facebook Sharing Debugger e no WhatsApp real — **pendente** (pós-deploy).

---

## Registro de progresso

| Data | Fase/Item | Commit | Observações |
|------|-----------|--------|-------------|
| 2026-09-03 | Plano criado | — | Levantamento inicial e definição das fases |
| 2026-09-03 | Fase 1 (1.1–1.8) | 96eee49 | MetaTags UTF-8; `class`→`className` na Notícia; `public/` (favicon.svg, og-default.svg, robots.txt); Sobre e Categorias migrados para fora do `blog_posts.json` (Sobre = estático, Categorias = Supabase); rota 404 + `NotFound.jsx`; NewsletterModal sem envio para lista de terceiros; `src/config/site.js` unifica e-mail/redes. Build verde. Teste visual pendente (1.9). |
| 2026-09-03 | Fase 2 (2.1–2.9) | 0204a33 | `PublicLayout` com `<Outlet/>` (App.jsx enxuto); `src/lib/images.js` (`resolvePostImages`/`toImageSrc`/`handleImageError`/placeholder) elimina parsing duplicado; `src/lib/sanitize.js` (DOMPurify) no HTML do artigo; `getPostById`→`getPostBySlugOrId` (frontend + admin); `postsService`/`supabase.js` reescritos sem `console.log` e sem teste de conexão no import; `ArticleHeader.jsx` e `SearchBar.jsx` removidos; deps `jsonwebtoken`/`bcryptjs` removidas; `processHtmlContent` simplificado. Build verde (142 módulos). |
| 2026-09-03 | Fase 3 (3.1–3.6) | 20400d3 | `JsonLd.jsx` + `structuredData.js` (Organization/WebSite na Home, NewsArticle/BreadcrumbList na notícia); `MetaTags` no Contato; funções serverless `api/sitemap.js` e `api/feed.js` + rewrites em `vercel.json`; `<link rel=alternate>` do RSS; header de cache corrigido para `/assets/`. Decisão 3.6 → Fase 9 (middleware de preview). Build verde (144 módulos). Validação 3.7 pendente (pós-deploy). |
| 2026-09-03 | Hotfix feed | 6cff845 | Feed público parou de carregar em produção: `count:'exact'` + `.range()` → `PGRST103` quando o `anon` via 0 linhas. Removido `count`; `hasMore` derivado de `pageSize+1`. Confirmado OK pelo usuário. |
| 2026-09-03 | Hotfix admin | b0f7f68 | `/admin` não abria após o lazy-loading da Fase 4.7. Revertido para import estático (App.jsx). Resto da Fase 4 mantido. |
| 2026-09-03 | Fase 5 (parcial) | eb24333 | Redesign da página de notícia: hero de imagem cheia com kicker+título sobre gradiente; corpo em `Newsreader` (nova fonte no `<link>`); coluna de leitura 720px; trilha de compartilhamento (sticky no desktop); `<time>` semântico; tempo de leitura; barra de progresso; breadcrumb no topo; bloco de autores redesenhado (bios no mapa `AUTHOR_BIOS`). Pendentes: 5.6 (autores via Supabase), 5.7 ("Leia também"), 5.10 (newsletter). Build verde. Teste visual pendente (sem navegador nesta sessão). |
| 2026-09-03 | Navbar | 02775ac | Nome do site em `Newsreader` (serif); "Instagram" vira ícone (`FaInstagram`). |
| 2026-09-03 | Fase 9 (9.1–9.3) | _a commitar_ | `middleware.js` (Edge da Vercel) injeta título/OG/Twitter/JSON-LD por matéria para crawlers de preview (WhatsApp etc.), buscando o post no Supabase via REST; humanos passam direto. `public/og-default.png` 1200×630 gerado; `MetaTags` resolve `og:image` absoluta. Falta 9.4 (validar no ar). |
| 2026-09-03 | Incidentes encerrados | — | Backend verificado 100% OK (curl da query exata + `/sitemap.xml` com 128 artigos). O que restava era **cache do navegador** servindo JS de um deploy intermediário quebrado (`3373f8b`). Confirmado funcionando em janela anônima (feed + admin). Lição: (1) validar mudanças na camada de dados contra o Supabase real antes do deploy; (2) evitar vários pushes seguidos — cada deploy intermediário quebrado pode ficar em cache. |
| 2026-09-03 | Fase 4 (4.1–4.4, 4.7) | 3373f8b | Feed público paginado (`getPostsPage`/`.range()`); `getPostsByCategory` e `getCategoryNames` no servidor; Home com "Carregar mais"; nova página `/busca` server-side (`Busca.jsx`); fontes em 1 `<link>` com `swap`; `React.lazy` no admin (8 chunks); LCP da notícia (`fetchPriority`, sem `lazy`, `width/height`) + `decoding="async"` nas imagens; `@tiptap/*` removido (sem uso). Build verde (145 módulos, bundle 130 kB gzip). 4.5/4.6(srcset)/4.8 adiados. |
| 2026-09-03 | Fase 9 (9.1–9.3) + fixes | 6997309, 850209b, a050697 | Middleware de preview no ar e **verificado** (WhatsApp/FB/Twitter recebem título/descrição/imagem da matéria). Ajustes: sem `og:image:width/height` forçado na imagem da matéria; "Resumo" do editor usado inteiro no `og:description`. |
| 2026-09-03 | Fase 5 (5.6, 5.7, 5.10) | _a commitar_ | Autores: avatar/link vêm da tabela `authors` (`getAuthorProfiles`), mapa local vira fallback. "Leia também" ao final (`getRelatedPosts`, mesma editoria + recentes). Newsletter: `NewsletterBar` (faixa dispensável no rodapé, snooze 30 dias); `NewsletterModal.jsx` removido. Build verde. |
