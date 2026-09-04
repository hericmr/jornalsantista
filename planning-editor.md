# Plano de Melhorias — Editor de Matérias (Admin)

> Escopo: as telas de **criação de nova postagem** (`/admin/noticias/nova`) e
> **edição de postagem publicada** (`/admin/noticias/editar/:id`), mais o que
> alimenta esse fluxo (lista de matérias, upload de imagens, publicação).
>
> Objetivo: transformar um formulário improvisado num editor editorial
> profissional — confiável, rápido, sem perda de trabalho, com pré-visualização
> fiel e sem quebrar SEO/links já compartilhados.
>
> Método: mesmo do `planning.md` — fases pequenas e verificáveis, cada uma
> terminando com `npm run build` limpo + teste manual das telas afetadas.
> Nunca quebrar o que já funciona. Marcar `[x]` conforme concluído e registrar
> no fim do arquivo.

---

## 1. Estado atual (levantamento)

**Arquivos no fluxo:**

| Arquivo | Papel |
|---|---|
| `src/admin/pages/AdminNovaNoticia.jsx` (582 l.) | Criar matéria |
| `src/admin/pages/AdminEditarNoticia.jsx` (648 l.) | Editar matéria — ~90% copiado do anterior |
| `src/admin/pages/AdminNoticias.jsx` | Lista/exclusão de matérias |
| `src/lib/postsService.js` | `savePost`, `getPostBySlugOrId`, `getAllAuthors`… |
| `src/lib/supabase.js` (`postsAPI`) | CRUD no Supabase |
| `src/utils/textUtils.js` | `slugify`, `processHtmlContent`, `stripHtml` |
| `src/lib/sanitize.js` | `sanitizeHtml` (DOMPurify) — usado só na leitura pública |
| `src/pages/Noticia.jsx` | Render público (referência do que o editor precisa produzir) |

**Como o conteúdo é salvo hoje:** `text_content` recebe uma string; a "formatação"
são botões que embrulham a seleção do `<textarea>` em HTML cru (`<strong>`,
`<blockquote>`, `<ul><li>…`). O público roda `processHtmlContent` →
`sanitizeHtml` → `dangerouslySetInnerHTML`. A 1ª imagem do array `images` vira o
_hero_ e o `og:image` (usado pelo `middleware.js` nos previews de link).

### Problemas encontrados

| # | Problema | Gravidade |
|---|----------|-----------|
| **E1** | `AdminNovaNoticia` e `AdminEditarNoticia` são quase idênticos (toolbar, upload, seletor de autores, layout). Toda correção precisa ser feita 2×; já divergiram (listas de autores diferentes, `<select>` "Categoria" morto só na edição). | Alta |
| **E2** | "Editor" é um `<textarea>` que exige HTML na mão. Sem WYSIWYG, sem H2/H3, sem link (o ícone `FaLink` é importado e nunca usado), sem desfazer estruturado. | Alta |
| **E3** | Sem pré-visualização. O autor não vê o resultado (serifa Newsreader, coluna 720px, sanitização) antes de publicar. | Alta |
| **E4** | Escrita em texto puro: `processHtmlContent` só troca `\n`→`<br>` quando **não** há tag de bloco. Resultado real = "sopa de `<br>`", nunca `<p>`. | Alta |
| **E5** | Salvar sempre faz `slug = slugify(title)`. Renomear uma matéria **publicada** muda o slug silenciosamente → quebra links compartilhados, RSS, sitemap e índice do Google. | Alta |
| **E6** | Sem checagem de slug duplicado. Dois títulos parecidos geram slugs iguais → `getPostBySlug` faz `.single()` e passa a falhar/entregar o post errado. | Alta |
| **E7** | Sem proteção contra perda de trabalho: nenhum autosave, nenhum aviso de "alterações não salvas". Refresh/aba fechada = tudo perdido. | Alta |
| **E8** | Botão "🧪 Testar Supabase" **em produção** insere posts de lixo na tabela real `posts`. | Alta |
| **E9** | Data de publicação é `<input type="date">` → perde a hora (o público mostra "17h30"). `new Date('2026-09-03')` é interpretado em UTC → pode exibir o dia anterior no fuso de Brasília. | Alta |
| **E10** | Status (`draft`/`published`/`archived`) e data de publicação são campos soltos e independentes. Dá para "publicar" sem data, ou pôr data sem publicar. Não há ação única e clara de **Publicar**. | Alta |
| **E11** | Imagens só entram numa galeria anexada **depois** do texto. Impossível inserir imagem no meio do corpo, com legenda/crédito. | Alta |
| **E12** | Upload de imagem: sem validação de tipo/tamanho, sem compressão, nome do arquivo = `Date.now()-nome original` (mantém espaços, acentos, maiúsculas → chaves sujas no Storage). Sem barra de progresso, sem drag & drop. | Média |
| **E13** | Remover imagem tira do array mas **não apaga do Storage** → arquivos órfãos acumulam. | Média |
| **E14** | Não dá para escolher qual imagem é a de destaque/OG nem reordenar a galeria — é sempre a `images[0]`, sem indicação visual. | Média |
| **E15** | Sem `alt` por imagem. O público gera `alt="{título} — imagem N"`. Ruim para acessibilidade e SEO. | Média |
| **E16** | Categorias: campo de texto livre separado por vírgula, sem autocomplete (existe `getCategoryNames`). "Cultura" / "cultura" / "Cultura " viram 3 categorias. | Média |
| **E17** | Autores: `AdminNovaNoticia` tem 4 nomes _hardcoded_; `AdminEditarNoticia` lê da tabela `authors`. Comportamentos diferentes na mesma tarefa. `onKeyPress` (depreciado). | Média |
| **E18** | Feedback tudo via `alert()` / `window.confirm()` — bloqueia a thread, feio, sem `aria-live`. | Média |
| **E19** | Sem concorrência: `updated_at` é gravado mas nunca lido. Dois editores = o último salva por cima, sem aviso. | Média |
| **E20** | Sem `Ctrl+S`. Sem "ver esta matéria no site" (só link genérico para a Home). Nenhum histórico de revisões / quem editou. | Média |
| **E21** | Excerpt sem contador. Ele vira a `meta description` e o `og:description` (via `middleware.js`); o ideal é ~120–160 caracteres. | Média |
| **E22** | `console.log` de debug espalhados, inclusive **dentro do JSX** (`{console.log(...)}` no render dos badges de autor). | Baixa |
| **E23** | `AdminNoticias` chama `getAllPosts()` — traz todos os posts com o `content` inteiro (128+ artigos) sem paginação nem busca. Vai degradar. | Média |
| **E24** | `savePost` faz malabarismo frágil com `content` vs `text_content` (deleta um, mantém o outro). Nomenclatura inconsistente em todo o código. | Média |
| **E25** | Nenhuma validação real além do `required` de título/conteúdo. Sem checklist de publicação (resumo, categoria, imagem, autor, alt). | Média |

---

## 2. Princípios de execução

1. Uma fase = um conjunto coeso de mudanças + `npm run build` verde + commit.
2. Não mexer no site público (`src/pages/**`, `src/components/**`) além do
   necessário para o editor produzir o mesmo HTML que o público já sabe render.
3. **Preservar slugs de matérias publicadas.** Qualquer mudança de slug é opt-in
   e explícita.
4. O HTML gerado pelo editor tem que passar limpo por `sanitizeHtml` +
   `processHtmlContent` — a _allowlist_ do editor e a do DOMPurify andam juntas.
5. Português no código/UI, como o resto do projeto.
6. Sem dependência pesada sem necessidade; anotar cada uma adicionada.

---

## 3. Fases

### Fase A — Unificação e base técnica (refactor, sem mudança visual)

**Objetivo:** uma só implementação para as duas telas. Pré-requisito de tudo.

- [x] **A1** Criar `src/admin/components/NoticiaForm.jsx` — formulário único
  (título, resumo, conteúdo, categorias, autores, status, data, imagens). _(eaaaf58)_
- [x] **A2** Criar `src/admin/hooks/useNoticiaForm.js` — estado do post, `loadPost`,
  `handleChange`, `submit`, flags `saving`/`loading`. `AdminNovaNoticia` e
  `AdminEditarNoticia` viraram cascas finas (`<NoticiaForm mode="new|edit" />`).
  _(eaaaf58 + passo 5)_ — `dirty` fica para a Fase F.
- [x] **A3** Removido: botão "🧪 Testar Supabase" + `testSupabaseConnection`, o
  `<select>` "Categoria" morto da edição, todos os `console.log`. _(c5d28d6)_
- [x] **A4** `savePost` normaliza o corpo e grava `content` + `text_content` em
  sincronia (leitores usam `content || text_content`); malabarismo removido. _(a7a5998)_
  Convergir para uma coluna só = Fase I / migração futura.
- [x] **A5** `AdminFeedbackProvider` + `useToast` + `useConfirm`; `alert`/`confirm`
  trocados nas 3 telas do fluxo. _(05a91c4)_ Falta em Dashboard/Categorias/Configurações.
- [ ] **A6** `npm run build` verde + smoke test: criar rascunho, editar, salvar.

---

### Fase B — Slug, data e publicação (integridade de SEO e links)

**Objetivo:** parar de quebrar links e datar as matérias corretamente.

- [ ] **B1** Campo **Slug** visível, gerado a partir do título enquanto o autor
  não o toca. Em `mode="edit"` de matéria já publicada: bloqueado por padrão,
  com botão "Alterar slug" e aviso ("links antigos deixarão de funcionar").
- [ ] **B2** Validar slug único antes de salvar (`postsAPI.getPostBySlug`,
  ignorando o próprio id). Se colidir, sufixar `-2`, `-3`… e avisar.
- [ ] **B3** `datetime-local` para a data de publicação, com helpers de conversão
  em `America/Sao_Paulo` ↔ ISO/UTC (corrige o _off-by-one_ de fuso).
- [ ] **B4** Ações de publicação explícitas no lugar do `<select>` de status:
  **Salvar rascunho** · **Publicar agora** · **Agendar** (data futura) ·
  **Despublicar** · **Arquivar**. O `status` continua sendo a coluna; a UI é que
  fica clara.
- [ ] **B5** Ao publicar pela 1ª vez sem data, preencher `published_at = agora`.
  `updated_at` sempre no `save` (já acontece) e passar a **exibir** "atualizado
  em…" no editor.
- [ ] **B6** _(decisão)_ Se o slug de matéria publicada mudar: registrar o antigo
  para um redirect 301 no `middleware.js`. Ver §5.

---

### Fase C — Editor de conteúdo rico

**Objetivo:** escrever sem saber HTML e sem gerar "sopa de `<br>`".

- [ ] **C1** _(decisão de tecnologia — ver §5)_ Recomendado: **TipTap headless**
  (ProseMirror) com toolbar própria em Bootstrap, saída **HTML** compatível com a
  _allowlist_. Alternativas: Lexical; ou `textarea` + Markdown (`marked`) se a
  equipe preferir texto puro versionável.
- [ ] **C2** Blocos e marcas: parágrafo, H2, H3, **negrito**, _itálico_, lista
  ordenada/não-ordenada, citação, **link** (com editor de URL + `rel`/`target`),
  linha divisória, "limpar formatação".
- [ ] **C3** Inserir **imagem no corpo** (upload inline no ponto do cursor), com
  `alt` e legenda (`<figure><img><figcaption>`).
- [ ] **C4** Colar de Word/Google Docs limpando `style`, `class`, `<span>` vazios,
  comentários condicionais.
- [ ] **C5** Revisar `src/lib/sanitize.js`: garantir que `<figure>`,
  `<figcaption>`, `<h2>`, `<h3>`, `<hr>`, `<a rel target>` passam; manter o
  bloqueio de `script`/`iframe`/`style`/`form`. Testar `processHtmlContent` com a
  nova saída (não deve mais cair no ramo do `<br>`).
- [ ] **C6** Rodapé do editor: contador de palavras + tempo estimado de leitura
  (mesma fórmula do público: `palavras / 200`).
- [ ] **C7** Migração: matérias antigas continuam abrindo (o editor aceita o HTML
  existente; texto puro legado é convertido para `<p>` na 1ª edição).

---

### Fase D — Mídia

**Objetivo:** upload confiável e imagens bem descritas.

- [ ] **D1** Validar tipo (`image/*`) e tamanho (ex.: ≤ 8 MB); comprimir/resize
  no cliente (`canvas`) para largura máx. ~2000px antes do upload.
- [ ] **D2** Nome de arquivo normalizado: `slug-do-post/{slugify(nome)}-{hash6}.webp|jpg`.
- [ ] **D3** Drag & drop + barra de progresso por arquivo + estado de erro por
  arquivo (hoje é um `alert` que aborta tudo).
- [ ] **D4** Escolha explícita da **imagem de destaque** (marca "capa/OG") e
  **reordenar** a galeria (drag). O público passa a usar a marcada, com _fallback_
  para a primeira.
- [ ] **D5** `alt` (obrigatório para publicar) e crédito/legenda por imagem.
  _Decisão de modelo:_ evoluir `images: string[]` para `images: {url, alt, caption, credit, cover}[]`
  com retrocompatibilidade em `resolvePostImages` (aceitar string e objeto). Ver §5.
- [ ] **D6** Ao remover imagem, apagar do Storage (ou marcar para coleta) — evitar
  órfãos. Precisa de rota serverless com service key **ou** política de bucket.

---

### Fase E — Pré-visualização e assistência editorial

**Objetivo:** ver o resultado e publicar com qualidade.

- [ ] **E1** **Preview fiel**: painel/aba que renderiza o conteúdo com o CSS
  público (`.article-content`, Newsreader, coluna 720px, `sanitizeHtml` +
  `processHtmlContent`). Ideal: reusar um componente extraído de `Noticia.jsx`.
- [ ] **E2** "Ver no site" apontando para o **slug real** desta matéria em nova
  aba; para rascunho, rota de preview autenticada (`/noticia/:slug?preview=token`).
- [ ] **E3** Painel **SEO/compartilhamento**: contador do título, contador do
  resumo (120–160, verde/amarelo/vermelho), _preview do card_ (WhatsApp/Facebook)
  usando as mesmas regras do `middleware.js`, aviso se não há imagem de capa.
- [ ] **E4** **Checklist de publicação** (bloqueia ou só avisa): título, resumo,
  ≥1 categoria, imagem de capa, `alt` em todas as imagens, ≥1 autor, data.

---

### Fase F — Não perder trabalho + concorrência

**Objetivo:** confiança para escrever textos longos.

- [ ] **F1** **Autosave local** (IndexedDB/`localStorage`) por matéria a cada
  ~5 s quando `dirty`; ao reabrir, oferecer "recuperar rascunho não salvo".
- [ ] **F2** Guard de **alterações não salvas**: `beforeunload` + bloqueio de
  navegação do React Router (`useBlocker`).
- [ ] **F3** **Concorrência otimista**: guardar o `updated_at` do carregamento;
  no `save`, se o registro no banco tiver `updated_at` mais novo, avisar
  ("editado por outra pessoa às …") e oferecer recarregar/sobrescrever.
- [ ] **F4** _(opcional)_ Autosave de rascunho **no servidor** (coluna
  `draft_content` ou tabela `post_drafts`) para não depender do navegador.

---

### Fase G — Lista de matérias (apoio ao fluxo)

**Objetivo:** achar e abrir a matéria certa rápido.

- [ ] **G1** Paginação + busca server-side em `AdminNoticias` (não trazer o
  `content` inteiro — `select` enxuto: id, título, status, datas, autor).
- [ ] **G2** Filtros: status, categoria, autor; ordenar por publicação **ou**
  última atualização.
- [ ] **G3** Ações rápidas: **duplicar** matéria (novo rascunho), mudar status
  inline, "editar" já abre pelo id correto.
- [ ] **G4** Mostrar `updated_at` e autor da última edição na tabela.

---

### Fase H — Acessibilidade e produtividade

- [ ] **H1** `Ctrl/Cmd+S` salva; `Esc` fecha diálogos.
- [ ] **H2** `label`/`for` em todos os campos, foco visível, `aria-live` nos
  toasts, ordem de tabulação sã na toolbar.
- [ ] **H3** Layout responsivo do editor no mobile (coluna única, toolbar que não
  estoura, grid de imagens usável).
- [ ] **H4** _(opcional)_ Modo "escrita sem distração" (esconde a sidebar de
  configurações, foca o corpo).

---

### Fase I — Snapshot estático de conteúdo (track paralelo)

**Objetivo:** o site abre sem depender de uma ida ao Supabase em runtime. O
conteúdo é buscado **no build** e servido como arquivos estáticos junto do
deploy; a app lê o estático primeiro e só vai ao Supabase para o que falta ou
está mais novo (ou quando é o admin/preview).

**Por que:** Home e matéria abrem instantâneo; o site sobrevive a lentidão/queda
do Supabase; menos requests (limites/custo); conteúdo versionável = backup.

**Não é sobre o editor** — é um track de arquitetura em paralelo às Fases A–H.
Liga com o item 3.6 / 8.5 do `planning.md` (decisão de SSR/prerender pendente).

- [x] **I1** `scripts/build-content.js` (Node ESM, `fetch` REST — sem
  `@supabase/supabase-js`): roda antes do `vite build` (`"build": "node
  scripts/build-content.js && vite build"`). Escreve em `public/data/`:
  `index.json` (lista, só metadados — sem corpo), `posts/<slug>.json` (uma por
  matéria, corpo completo), `meta.json` (timestamp + contagens). Chave `anon`.
  Dedup de slug. **Nunca derruba o build**: erro/env ausente → aviso + exit 0.
  `categorias.json`/`autores.json` ficam para depois. _(a commitar)_
- [x] **I2** `postsService.js` static-first: `getPostsPage` (feed da Home +
  "todas" da Categorias) lê `/data/index.json`; novo `getPublicPostBySlug`
  (usado só pelo `Noticia.jsx`) lê `/data/posts/<slug>.json`. Fallback ao
  Supabase em qualquer falha, e para slug ausente do snapshot (matéria nova) ou
  URL com id numérico. Admin (`useNoticiaForm`) continua no `getPostBySlugOrId`
  ao vivo. Índice re-ordenado (data desc, sem-data no fim) = mesma ordem do
  `/feed.xml` atual. `searchPosts`/`getPostsByCategory`/`getCategoryNames` ainda
  Supabase (I2b). _(a commitar)_
- [x] **I3** `public/data/` no `.gitignore` — gerado no build, entregue no deploy,
  nunca commitado. _(a commitar)_
- [~] **I4** Frescor do conteúdo. Feito no código: header de cache do `/data/*`
  no `vercel.json` (`max-age=0, s-maxage=300, stale-while-revalidate=86400`; a
  Vercel purga o CDN a cada deploy, então um rebuild propaga na hora). **Falta
  o usuário nos dashboards:** criar Deploy Hook na Vercel + Database Webhook no
  Supabase (`posts`, insert/update/delete) apontando para o hook. Alternativa
  futura: proxy `api/republish.js` com cooldown (evita rebuild a cada save de
  rascunho) + botão "Republicar" no admin.
- [ ] **I5** Preview de rascunho continua lendo o Supabase ao vivo (o rascunho não
  entra no snapshot) — casa com a Fase E2.
- [ ] **I6** _(opcional)_ `api/sitemap.js` e `api/feed.js` podem passar a ler o
  `index.json` local em vez do Supabase, reduzindo acoplamento.
- [x] **I7** Fallback: sem `/data/index.json`, `getPostsPage`/`getPublicPostBySlug`
  usam o Supabase (implementado no I2). Confirmado: build local sem env não gera
  o snapshot e o site funciona pelo Supabase.

**Decisões tomadas (Fase I):**
- Chave no build: **`anon`** (o RLS/estado atual expõe tudo que o site já mostra).
- Ordem do feed: reordenado no cliente (data desc, sem-data no fim) = `/feed.xml`.
- `status` **não** é filtrado (127/128 são `draft` e são públicas hoje).

**Decisões em aberto (Fase I):**
- Gatilho de rebuild: webhook Supabase→Vercel direto (simples, rebuilda a cada
  save) vs. proxy `api/republish.js` com cooldown + botão no admin.
- `api/sitemap.js` / `api/feed.js` migram para o snapshot (I6) ou ficam.

---

## 4. Mudanças no Supabase (resumo)

| Fase | Mudança | Obrigatória? |
|---|---|---|
| B6 | Tabela/coluna para slugs antigos → redirect 301 | Só se B1 permitir trocar slug de publicado |
| D5 | `images` passa a aceitar objetos `{url, alt, caption, credit, cover}` | Sim (com retrocompat na leitura) |
| D6 | Rota serverless com service key **ou** policy de `delete` no bucket `noticias-imagens` | Sim para D6 |
| E2 | Token/policy para preview de rascunho | Só se E2 cobrir rascunho |
| F4 | `post_drafts` ou coluna `draft_content` | Opcional |
| G1 | Índices para busca/filtros em `posts` (status, published_at) | Recomendado |
| I4 | Database Webhook em `posts` → Deploy Hook da Vercel (rebuild ao publicar) | Sim para I4 |
| — | Consolidar seletor de autores na tabela `authors` (E17) | Recomendado |

---

## 5. Decisões em aberto

1. **Biblioteca do editor (C1):** TipTap (recomendado — foi removido na Fase 4 do
   `planning.md` por não estar em uso, reintroduzir de propósito), Lexical, ou
   Markdown puro. _Trade-off:_ TipTap = melhor UX, +~40–60 kB gzip só no bundle
   do admin; Markdown = leve e versionável, mas muda o formato salvo e exige
   converter o acervo.
2. **Slug de matéria publicada (B1/B6):** permitir trocar com redirect 301, ou
   travar de vez? Recomendação: travar por padrão, permitir com redirect.
3. **Modelo de `images` (D5):** migrar o array para objetos (retrocompat na
   leitura) vs. campo paralelo `image_meta`. Recomendação: evoluir o array.
4. **Deleção de órfãos (D6):** rota serverless (mais controle) vs. policy de
   bucket + limpeza agendada.
5. **Autosave no servidor (F4):** entra no MVP ou fica para depois? Recomendação:
   local (F1) no MVP, servidor depois.
6. **Snapshot estático (Fase I):** track paralelo. Decidido: fazer **depois** dos
   passos 1–3 da Fase A (quando o `savePost`/`text_content` estiver estável),
   porque as duas frentes mexem em `postsService.js`.

---

## 6. Ordem de entrega recomendada

**Track 1 — editor (principal):** Fase A → Fase B → Fase C (C1–C3, C5–C6) →
E1 + E3 → F1 + F2. Isso já resolve E1–E10, E18, E21, E22 e a maior parte de
E2/E3/E7. Depois: Fase D (mídia) → Fase E4/E2 → Fase G (lista) → Fase H →
opcionais (F4, H4).

**Track 2 — snapshot estático (paralelo):** entra **depois dos passos 1–3 da
Fase A** (limpeza + `savePost`/`text_content` estáveis). Fase I num bloco
próprio: I1 → I2 → I3 → I7 (MVP: site lê estático com fallback ao Supabase),
depois I4 (rebuild automático) e I5/I6. Os dois tracks compartilham
`postsService.js` — por isso a Fase I espera o A4.

Cada item marcável acima vira um commit pequeno com `build` verde + deploy;
o usuário testa no site online antes do próximo passo.

---

## 7. Registro de progresso

| Data | Fase/Item | Commit | Observações |
|------|-----------|--------|-------------|
| 2026-09-03 | Plano criado | — | Levantamento das telas `AdminNovaNoticia`/`AdminEditarNoticia` e do fluxo de publicação; 25 problemas catalogados (E1–E25); 8 fases (A–H). |
| 2026-09-03 | Fase A · passo 1 (A3) | c5d28d6 | Removido o botão "Testar Supabase" (inseria posts de teste na tabela real em produção), o `<select>` "Categoria" morto da tela Editar e todos os `console.log` de debug das duas telas. Sem mudança de comportamento. Build verde (145 módulos). |
| 2026-09-03 | Fase I planejada | — | Track paralelo de snapshot estático de conteúdo adicionado ao plano (I1–I7). Ordem: depois dos passos 1–3 da Fase A. |
| 2026-09-03 | Fase A · passo 2 (A4) | a7a5998 | `savePost` normaliza o corpo e grava `content` + `text_content` em sincronia (antes só gravava `text_content`, mas os leitores preferem `content` → edições do corpo não apareciam no site). Simplificado o malabarismo da função. Build verde (145 módulos). |
| 2026-09-03 | Fase A · passo 3 (A5) | 05a91c4 | `src/admin/components/AdminFeedback.jsx`: `AdminFeedbackProvider` + `useToast` + `useConfirm` (toasts com `aria-live`, diálogo de confirmação com Promise, `Esc` fecha). Provider montado em `App.jsx` em volta das `Routes` (instância única, sobrevive à navegação). `alert()`/`window.confirm()` trocados por toasts/diálogo em `AdminNovaNoticia`, `AdminEditarNoticia` e `AdminNoticias`. CSS em `index.css`. Falta trocar em `AdminDashboard`/`AdminCategorias`/`AdminConfiguracoes` (fora do fluxo do editor). Build verde (146 módulos, +1 kB gzip). |
| 2026-09-03 | Fase A · passo 4 (A1+A2a) | eaaaf58 | `src/admin/hooks/useNoticiaForm.js` (estado + regras: carregar, autores, upload de imagem, submit create/update) e `src/admin/components/NoticiaForm.jsx` (UI única). `AdminNovaNoticia.jsx` virou casca de 6 linhas (`<NoticiaForm mode="new" />`). Unificações já aplicadas na tela Nova: seletor de autores vem da tabela `authors` do Supabase (E17), `onKeyPress`→`onKeyDown`, `formatText` via ref, campo de novo autor controlado. `AdminEditarNoticia.jsx` **ainda não** usa o form novo — é o passo 5. Build verde (146 módulos). |
| 2026-09-03 | Fase A · passo 5 (A1+A2b) | 8c9bee2 | `AdminEditarNoticia.jsx` (592→10 linhas) passa a usar `<NoticiaForm mode="edit" id={id} />`. ~1.170 linhas duplicadas entre as duas telas eliminadas. `loadPost`/mapeamento de autores/`formatText`/upload agora vivem só no hook/componente. Warning de `exhaustive-deps` da tela Editar sumiu. Build verde (148 módulos, −1,3 kB gzip JS). **Fase A concluída** (falta só o passo 6: smoke test + marcar itens). |
| 2026-09-04 | Fase I · passo 1 (I1+I3) | 7e785cb | `scripts/build-content.js` gera o snapshot estático (`public/data/index.json` + `posts/<slug>.json` + `meta.json`) a partir do Supabase via REST com a chave `anon`, antes do `vite build`. À prova de falha: sem env ou erro de rede → aviso + exit 0. `public/data/` no `.gitignore`. **Validado no deploy:** `/data/meta.json` → `count: 128`; `index.json` (97 kB, 128 itens, sem corpo); `posts/<slug>.json` OK. Descoberta: 127/128 matérias têm `status: 'draft'` no banco mas aparecem no site → `status` não é gate de publicação; o snapshot e a app **não** filtram por status. |
| 2026-09-04 | Fase I · passo 2 (I2) | a1f800e | `postsService.js`: `getPostsPage` e novo `getPublicPostBySlug` (usado no `Noticia.jsx`) leem o snapshot primeiro, com fallback ao Supabase. Admin intacto. Ordem do índice bate com o `/feed.xml` (confirmado: Oxxo 03/09, FMI 22/01, …). Build verde. |
| 2026-09-04 | Fase I · passo 3 (I4 parcial) | _a commitar_ | `vercel.json`: header de cache do `/data/*` (`s-maxage=300, stale-while-revalidate=86400`). Falta o usuário criar o Deploy Hook (Vercel) + Database Webhook (Supabase) para rebuild automático ao editar/publicar. |
