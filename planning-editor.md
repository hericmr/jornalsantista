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

- [ ] **A1** Criar `src/admin/components/NoticiaForm.jsx` — formulário único
  (título, resumo, conteúdo, categorias, autores, status, data, imagens).
- [ ] **A2** Criar `src/admin/hooks/useNoticiaForm.js` — estado do post, `loadPost`,
  `handleChange`, `submit`, flags `saving`/`loading`/`dirty`. `AdminNovaNoticia` e
  `AdminEditarNoticia` viram cascas finas (`<NoticiaForm mode="new|edit" />`).
- [ ] **A3** Remover: botão "🧪 Testar Supabase" + `testSupabaseConnection`, o
  `<select>` "Categoria" morto da edição, todos os `console.log` (inclusive os de
  dentro do JSX). Manter `console.error` úteis atrás de `import.meta.env.DEV`.
- [ ] **A4** Padronizar o campo de conteúdo como `text_content` ponta a ponta;
  simplificar o bloco `content`/`text_content` do `savePost`.
- [ ] **A5** Trocar `alert`/`confirm` por um componente de _toast_ (`aria-live`) +
  diálogo de confirmação próprio (reaproveitável no `AdminNoticias`).
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

## 4. Mudanças no Supabase (resumo)

| Fase | Mudança | Obrigatória? |
|---|---|---|
| B6 | Tabela/coluna para slugs antigos → redirect 301 | Só se B1 permitir trocar slug de publicado |
| D5 | `images` passa a aceitar objetos `{url, alt, caption, credit, cover}` | Sim (com retrocompat na leitura) |
| D6 | Rota serverless com service key **ou** policy de `delete` no bucket `noticias-imagens` | Sim para D6 |
| E2 | Token/policy para preview de rascunho | Só se E2 cobrir rascunho |
| F4 | `post_drafts` ou coluna `draft_content` | Opcional |
| G1 | Índices para busca/filtros em `posts` (status, published_at) | Recomendado |
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

---

## 6. Ordem de entrega recomendada

**MVP "editor profissional":** Fase A → Fase B → Fase C (C1–C3, C5–C6) →
E1 + E3 → F1 + F2.
Isso já resolve E1–E10, E18, E21, E22 e a maior parte de E2/E3/E7.

**Depois:** Fase D (mídia) → Fase E4/E2 (checklist + preview de rascunho) →
Fase G (lista) → Fase H → itens opcionais (F4, H4).

Cada item marcável acima vira um commit pequeno com `build` verde.

---

## 7. Registro de progresso

| Data | Fase/Item | Commit | Observações |
|------|-----------|--------|-------------|
| 2026-09-03 | Plano criado | — | Levantamento das telas `AdminNovaNoticia`/`AdminEditarNoticia` e do fluxo de publicação; 25 problemas catalogados (E1–E25); 8 fases (A–H). |
