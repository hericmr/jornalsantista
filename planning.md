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

- [ ] **4.1** `getAllPosts` com paginação (`.range()`) e `select` só dos campos de listagem (sem `content`) (B17)
- [ ] **4.2** Home: "carregar mais" / scroll infinito; seções ("Últimas", "Mais lidas" se houver métrica)
- [ ] **4.3** Busca server-side: `ilike`/full-text no Supabase + página dedicada `/busca?q=` com destaque e estado "sem resultados" (B16)
- [ ] **4.4** Fontes: `preconnect`, remover `@import` em cascata, 2 famílias, `font-display: swap` (idealmente self-host)
- [ ] **4.5** Ícones: manter só um conjunto (`react-icons` **ou** `bootstrap-icons`)
- [ ] **4.6** Imagens: `width`/`height` explícitos, `srcset`/`sizes`, transforms do Supabase Storage para thumbnails; hero sem `lazy` + `fetchpriority="high"` (B20)
- [ ] **4.7** `vite build` com code splitting por rota (`React.lazy` nas páginas admin)
- [ ] **4.8** Medir antes/depois com Lighthouse (mobile) e anotar números

---

## Fase 5 — Experiência de leitura (página de notícia)

**Objetivo:** a tela mais importante do site.

- [ ] **5.1** Coluna de leitura com medida ~65–75ch, alinhamento à esquerda (remover `text-align: justify` e `white-space: pre-wrap` do `.article-content`)
- [ ] **5.2** Tipografia de corpo revisada (tamanho, entrelinha, ritmo de parágrafos, listas, citações)
- [ ] **5.3** `<time datetime>` semântico + data relativa ("há 2 horas") com fallback absoluto
- [ ] **5.4** Tempo estimado de leitura
- [ ] **5.5** Barra de progresso de leitura (fina, no topo)
- [ ] **5.6** Autores a partir da tabela `authors` do Supabase (`bio`, `avatar_url`, `slug`) — remover cadeia de `if (author === "...")` e imagens hardcoded
- [ ] **5.7** Bloco "Leia também" ao final: 3–4 notas da mesma categoria / mais recentes
- [ ] **5.8** Compartilhar: `navigator.share` no mobile + botão "copiar link"; rótulos `aria-label`; "X" no lugar de "Twitter"
- [ ] **5.9** Breadcrumb no topo (desktop e mobile), com JSON-LD (ligado à 3.3)
- [ ] **5.10** Newsletter: trocar modal bloqueante por faixa fixa inferior dispensável; contador robusto (B9)

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

- [ ] **9.1** Edge Middleware / função na Vercel que intercepta `/noticia/:slug`,
  detecta bots de preview (ou aplica a todos), busca o post no Supabase e injeta
  `<title>`, OG/Twitter tags e o JSON-LD `NewsArticle` no `index.html` servido
- [ ] **9.2** Exportar `public/og-default.png` (1200×630 raster) e trocar a
  constante em `MetaTags.jsx` (hoje aponta para SVG, que o WhatsApp ignora)
- [ ] **9.3** OG image por notícia: usar a 1ª imagem do post (já disponível) e,
  se não houver, cair no `og-default.png`
- [ ] **9.4** Testar no Facebook Sharing Debugger e no WhatsApp real

---

## Registro de progresso

| Data | Fase/Item | Commit | Observações |
|------|-----------|--------|-------------|
| 2026-09-03 | Plano criado | — | Levantamento inicial e definição das fases |
| 2026-09-03 | Fase 1 (1.1–1.8) | 96eee49 | MetaTags UTF-8; `class`→`className` na Notícia; `public/` (favicon.svg, og-default.svg, robots.txt); Sobre e Categorias migrados para fora do `blog_posts.json` (Sobre = estático, Categorias = Supabase); rota 404 + `NotFound.jsx`; NewsletterModal sem envio para lista de terceiros; `src/config/site.js` unifica e-mail/redes. Build verde. Teste visual pendente (1.9). |
| 2026-09-03 | Fase 2 (2.1–2.9) | 0204a33 | `PublicLayout` com `<Outlet/>` (App.jsx enxuto); `src/lib/images.js` (`resolvePostImages`/`toImageSrc`/`handleImageError`/placeholder) elimina parsing duplicado; `src/lib/sanitize.js` (DOMPurify) no HTML do artigo; `getPostById`→`getPostBySlugOrId` (frontend + admin); `postsService`/`supabase.js` reescritos sem `console.log` e sem teste de conexão no import; `ArticleHeader.jsx` e `SearchBar.jsx` removidos; deps `jsonwebtoken`/`bcryptjs` removidas; `processHtmlContent` simplificado. Build verde (142 módulos). |
| 2026-09-03 | Fase 3 (3.1–3.6) | _a commitar_ | `JsonLd.jsx` + `structuredData.js` (Organization/WebSite na Home, NewsArticle/BreadcrumbList na notícia); `MetaTags` no Contato; funções serverless `api/sitemap.js` e `api/feed.js` + rewrites em `vercel.json`; `<link rel=alternate>` do RSS; header de cache corrigido para `/assets/`. Decisão 3.6 → Fase 9 (middleware de preview). Build verde (144 módulos). Validação 3.7 pendente (pós-deploy). |
