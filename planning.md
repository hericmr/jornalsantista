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
- [x] **2.7** Adicionar `sanitize-html` (ou `dompurify`) e sanitizar todo HTML de artigo/sobre (B7) — _nova dep_
- [x] **2.8** Build verde + smoke test

---

## Fase 3 — SEO e compartilhamento

**Objetivo:** aparecer bem no Google/Google News e em links de WhatsApp/Facebook.

- [ ] **3.1** `<MetaTags>` em todas as páginas públicas (Categorias, Sobre, Contato, 404) (B15)
- [ ] **3.2** `<link rel="canonical">` por rota
- [ ] **3.3** JSON-LD: `NewsArticle` na notícia, `BreadcrumbList`, `WebSite`+`SearchAction` na Home, `Organization` global (B18)
- [ ] **3.4** `sitemap.xml` dinâmico (script de build que lê o Supabase ou função serverless) + `robots.txt` referenciando ele
- [ ] **3.5** Feed RSS/Atom em `/feed.xml`
- [ ] **3.6** Decisão documentada: prerender/SSR — opções (a) `vite-react-ssg`, (b) função serverless na Vercel que injeta OG tags para `/noticia/:slug`, (c) migração Astro. Escolher e abrir fase própria.
- [ ] **3.7** Validar com Rich Results Test / Facebook Sharing Debugger

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

## Registro de progresso

| Data | Fase/Item | Commit | Observações |
|------|-----------|--------|-------------|
| 2026-09-03 | Plano criado | — | Levantamento inicial e definição das fases |
| 2026-09-03 | Fase 1 (1.1–1.8) | _a commitar_ | MetaTags UTF-8; `class`→`className` na Notícia; `public/` (favicon.svg, og-default.svg, robots.txt); Sobre e Categorias migrados para fora do `blog_posts.json` (Sobre = estático, Categorias = Supabase); rota 404 + `NotFound.jsx`; NewsletterModal sem envio para lista de terceiros; `src/config/site.js` unifica e-mail/redes. Build verde. Teste visual pendente (1.9). |
