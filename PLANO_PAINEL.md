# PLANO_PAINEL.md — Reformulação do editor de matérias

> Alvo: `src/admin/components/NoticiaForm.jsx` + `src/admin/hooks/useNoticiaForm.js`
> (telas `/admin/noticias/nova` e `/admin/noticias/editar/:id`), mais o que o
> corpo da matéria toca no salvamento, na sanitização e na pré-visualização.
>
> Método: fases E1..E8 ordenadas por dependência e risco. Cada fase termina com
> `npm run build` verde e o painel funcionando, sem estado quebrado intermediário.
> Cada tarefa cabe em um commit. Marcar `- [x]` ao concluir.
>
> **Nada é implementado antes da aprovação deste plano.**

---

## 0. STATUS ATUAL — pausado em 2026-09-04, retomar por aqui

**Onde paramos:** Etapa **E1 concluída** e Etapa **E2 concluída** (T2.1–T2.6, a
T2.6 fora do plano original — layout de escrita pedido pelo usuário). Tudo
commitado e **em produção** (`origin/main`, até o commit `efe0e09`).

**🔴 Investigação aberta, NÃO resolvida — tratar antes de qualquer coisa nova:**
Usuário reportou que, depois de salvar uma edição, o conteúdo parece **não ter
mudado**. Ainda não sabemos se é:
  (a) só o **cache do site público** (a página `/noticia/:slug` lê primeiro um
      snapshot estático que leva ~2 min para regenerar após salvar — isso é
      comportamento *pré-existente*, da "Fase I" do `planning-editor.md`, não
      é algo desta sessão), ou
  (b) um **bug real de salvamento** — possivelmente relacionado às mudanças de
      T1.2/T1.3 em `savePost` (`src/lib/postsService.js`): antes do UPDATE
      principal, agora existe um UPDATE extra só para `content_backup`
      (`postsAPI.getPostById` + `postsAPI.updatePost` com só esse campo) —
      dois `UPDATE`s sequenciais na mesma linha. Não identifiquei um bug
      concreto lendo o código, mas essa é a área mais suspeita porque foi
      tocada nesta sessão.

**Pedido ao usuário (respondido? — conferir ao retomar):**
  1. Rodar no SQL editor do Supabase, logo após salvar uma edição de teste
     (com um marcador óbvio tipo "TESTE123" no corpo):
     ```sql
     select id, title, updated_at, content_backup is not null as tem_backup,
            left(content, 200) as content_preview
     from posts
     where id = <ID>;
     ```
     — `updated_at` está fresco? `content_preview` mostra a edição?
  2. Checar o Console do DevTools (F12) no momento de clicar "Salvar" — algum
     erro em vermelho?

**Ao retomar amanhã:**
  1. Ler a resposta do usuário a esse pedido (pode ter vindo depois desta
     sessão, fora do chat).
  2. Se `updated_at`/`content_preview` confirmarem que o banco atualiza
     normalmente → é só o cache do snapshot (a); nesse caso, ação sugerida:
     melhorar o aviso pós-salvar ("Notícia atualizada — o site pode levar
     ~2 min para atualizar") e considerar adiantar parte da E7/T7.4 (preview
     fiel, que lê o estado ao vivo do formulário, não o snapshot).
  3. Se o banco **não** atualizar → bug real em `savePost`
     (`src/lib/postsService.js`, função `savePost`, bloco `if (!isNew && hasId)`
     — os dois `UPDATE`s sequenciais de T1.2). Investigar com prioridade
     máxima antes de tocar em qualquer outra coisa — **não iniciar a Etapa E3**
     enquanto isso não estiver resolvido e confirmado pelo usuário.
  4. Não foi possível reproduzir localmente (sem `.env`/Supabase neste
     ambiente) — a investigação depende dos dados que o usuário trouxer.

---

## 1. Visão geral

### O que muda

- O corpo da matéria passa a ser editado num **editor richtext TipTap**, carregado
  sob demanda (`dynamic import`) só na rota do admin. Substitui o `<textarea>` +
  os 6 botões que embrulham HTML cru (`formatText`).
- **Barra de ferramentas completa**: negrito, itálico, riscado, H2/H3/H4, lista
  ordenada/não-ordenada, citação em bloco, link com validação de URL, linha
  divisória, limpar formatação, desfazer/refazer. Menu flutuante de seleção
  (BubbleMenu) e atalhos de teclado padrão.
- **Colar limpo**: remoção automática de `style=`, `class=` não-permitida,
  `<span>` vazio e lixo de Word / Google Docs / páginas web, preservando a
  estrutura semântica.
- **Rotina "reparar texto puro"** (sob demanda, uma matéria por vez): converte o
  bloco único legado em parágrafos, detectando prováveis intertítulos. Grava o
  conteúdo anterior em `content_backup` antes; reversível.
- **Elementos jornalísticos no corpo**: intertítulo, olho (citação destacada),
  boxe, crédito de foto, nota do editor.
- **Imagens no corpo**: upload ou URL, com legenda, crédito e texto alternativo
  obrigatório, como `<figure><img><figcaption>` no HTML do corpo, com formatação
  customizada (alinhamento e tamanho — D7). Incorporação de vídeo/posts por URL
  fica **adiada** (D2).
- **Fluxo de escrita**: autosave local de rascunho com indicador de estado, aviso
  ao sair com alterações não salvas, contador de palavras e tempo de leitura,
  pré-visualização fiel ao site, modo foco.
- **Rede de segurança**: coluna `content_backup` (aditiva), com o corpo anterior
  copiado a cada salvamento e um botão único "Desfazer último salvamento".
- **Sanitização na escrita**: a allowlist do DOMPurify em `src/lib/sanitize.js` é
  revista/ampliada e passa a ser aplicada também no momento de salvar, para que o
  que é gravado seja exatamente o que o público renderiza.

### O que se mantém (não tocar)

- Todos os campos de metadados atuais, exatamente como funcionam hoje: título,
  resumo (`excerpt`), categorias, autores (`authors` + `author` derivado),
  data de publicação (`published_at` + `<input type="date">`), status, tags.
- `savePost` gravando `content` **e** `text_content` em sincronia.
- O array `images` (jsonb), `images[0]` como hero e `og:image`, e a galeria de
  upload atual na sidebar.
- Pipeline público de render (`processHtmlContent` → `sanitizeHtml` →
  `dangerouslySetInnerHTML` em `src/pages/Noticia.jsx`).
- `requestRepublish()` disparado após o salvamento.
- Snapshot estático (`public/data/*`) e o middleware de crawlers.

### O que é descartado

- O `<textarea>` do corpo, a função `formatText` e a toolbar manual de
  `NoticiaForm.jsx`.
- CSS morto de tentativas anteriores: `.tiptap-editor-wrapper` e `.editor-toolbar`
  em `src/index.css` (se não for reaproveitado — ver E8/T8.5).
- Imports não usados no fluxo (`FaLink` importado e nunca usado, etc.).

---

## 2. Decisões técnicas (resolvidas em 2026-09-04)

**D1 — Marcação dos elementos jornalísticos.** ✅ Aprovada a proposta:
- Intertítulo → `<h2>` / `<h3>` (sem tag nova).
- Olho (citação destacada) → `<blockquote class="olho">`.
- Boxe → `<aside class="boxe">`.
- Crédito de foto → `<figcaption class="credito">` dentro de `<figure>`.
- Nota do editor → `<aside class="nota-editor">`.

**D2 — Incorporação de vídeo/posts por URL.** ⏸️ **Adiada.** Nesta rodada, só
imagem no corpo. E6/T6.3 fica registrada como fora do escopo atual (ver §5).

**D3 — Autosave local.** ✅ `localStorage`, uma chave por matéria
(`id` / "nova").

**D4 — Detecção de intertítulo na rotina de reparo.** ✅ Linha isolada (cercada
por linha em branco), ≤ 60 caracteres, sem pontuação final (`. ? ! : ;`) →
vira `<h2>`.

**D5 — "Limpar formatação".** ✅ Remove só marcas inline (negrito, itálico,
riscado, link, sublinhado) e rebaixa heading da seleção para parágrafo; não
mexe em listas/citações.

**D6 — Elementos jornalísticos na UI.** ✅ Dropdown "Inserir" na toolbar.

**D7 — Formatação customizada de imagem no corpo.** ➕ Pedido acrescentado pelo
usuário: além de inserir imagem com legenda/crédito/alt, poder **formatar** a
imagem no corpo (alinhamento e tamanho). Entra como E6/T6.4. Proposta de opções
a confirmar na T6.4: alinhamento (esquerda / centro / direita / largura plena) e
tamanho (pequena ≈ 320 px / média ≈ 480 px / grande = largura da coluna /
plena = *full-bleed*), aplicados como classes na `<figure>`
(`class="fig-esq fig-media"` etc.) e refletidos na allowlist e no CSS público.

---

## 3. Etapas

Ordem: **E1** (rede de segurança + sanitização, sem mudança de UX) → **E2**
(editor base) → **E3** (colar limpo) → **E4** (reparar texto puro) → **E5**
(elementos jornalísticos) → **E6** (mídia no corpo) → **E7** (fluxo de escrita +
preview) → **E8** (qualidade e acessibilidade).

---

### E1 — Rede de segurança do conteúdo e base de sanitização

*Objetivo da etapa:* criar a proteção contra perda de conteúdo e alinhar a
sanitização, sem alterar ainda a experiência de edição (o `<textarea>` continua).

- [x] **T1.1 — Revisar e travar a allowlist do DOMPurify**
  - **Objetivo:** garantir que `figure`, `figcaption`, `hr`, `cite`,
    `blockquote`, `h2`–`h4`, listas e `a[href target rel]` passem, e que só um
    conjunto fixo de valores de `class` seja aceito (os de D1).
  - **Arquivos:** `src/lib/sanitize.js`; novo `src/lib/__tests__/sanitize.test.js`
    (ou `scripts/test-sanitize.mjs` se não houver runner de teste).
  - **Critério de aceite:** dado um HTML com
    `<blockquote class="olho">`, `<aside class="boxe">`, `<figure><img><figcaption class="credito">`,
    `<hr>`, `<a href target rel>` e também `<script>`, `<iframe>`, `style="..."`,
    `class="mso-x"` e `<span>` vazio — a saída de `sanitizeHtml` **mantém** os
    primeiros e **remove** `script`, `iframe`, `style=`, a classe não-permitida e
    o `<span>` vazio.
  - **Como verificar:** rodar o arquivo de teste (`node scripts/test-sanitize.mjs`
    ou `npm test`); a saída lista cada caso como PASS/FAIL. Sem runner: um HTML de
    fixture + `console.log(sanitizeHtml(fixture))` comparado à string esperada.
  - **Risco e reversão:** baixo. Risco = allowlist muito restritiva quebrar HTML
    antigo válido. Reversão = `git revert` do commit; `sanitize.js` volta ao
    estado atual. Nenhuma migração envolvida.
  - **Dependências:** D1 (nomes das classes).

- [x] **T1.2 — Criar a coluna `content_backup` e copiá-la no `savePost`**
  - **Objetivo:** antes de todo UPDATE, gravar o corpo atual da linha em
    `content_backup`.
  - **Arquivos:** `src/lib/postsService.js` (`savePost`); novo
    `scripts/sql/2026-xx-content-backup.sql` com o SQL abaixo.
  - **SQL de criação:**
    ```sql
    alter table public.posts add column if not exists content_backup text;
    ```
  - **SQL de reversão:**
    ```sql
    alter table public.posts drop column if exists content_backup;
    ```
  - **Critério de aceite:** ao salvar uma edição de matéria existente, a query
    `select id, left(content,40) as atual, left(content_backup,40) as backup from posts where id = <ID>;`
    mostra em `content_backup` o corpo que estava salvo **antes** deste
    salvamento. Em criação de matéria nova, `content_backup` fica `null`.
  - **Como verificar:** aplicar o SQL no Supabase (SQL editor). Editar uma
    matéria de teste trocando uma palavra, salvar, rodar a query acima e conferir
    que `backup` é o texto anterior. Salvar de novo e conferir que `backup` passou
    a ser a versão intermediária.
  - **Risco e reversão:** baixo — coluna aditiva, nullable, sem default, sem
    constraint; não afeta nenhum leitor. Reversão = SQL de reversão + `git revert`
    do commit de `postsService.js`.
  - **Dependências:** nenhuma.

- [x] **T1.3 — Aplicar `sanitizeHtml` na escrita do corpo**
  - **Objetivo:** o corpo gravado em `content`/`text_content` já passa pela mesma
    sanitização do público, para "o que salvo === o que renderiza".
  - **Arquivos:** `src/lib/postsService.js` (`savePost`, aplicar no `body` antes
    de montar `supabaseData`).
  - **Critério de aceite:** salvar uma matéria cujo corpo contenha
    `<script>alert(1)</script>` e `style="color:red"` → a query
    `select content from posts where id = <ID>;` retorna o corpo **sem** o
    `<script>` e **sem** `style=`. Uma matéria com HTML já limpo salva **sem
    diferença** (idempotência: salvar 2× seguidas não muda o valor).
  - **Como verificar:** editar matéria de teste, colar o trecho malicioso no
    `<textarea>` atual, salvar, rodar a query. Repetir o salvamento e comparar
    `content` (deve ser igual).
  - **Risco e reversão:** médio — sanitizar pode alterar HTML legado idiossincrático.
    Mitigação: T1.2 (backup) já está no ar antes desta tarefa. Reversão =
    `git revert`; o backup permite restaurar linha a linha via T1.4.
  - **Dependências:** **T1.1** (allowlist final), **T1.2** (backup no ar primeiro).

- [x] **T1.4 — Botão "Desfazer último salvamento"**
  - **Objetivo:** restaurar `content_backup` como corpo atual, num clique, sem
    tela de histórico.
  - **Arquivos:** `src/admin/components/NoticiaForm.jsx` (botão no modo `edit`),
    `src/admin/hooks/useNoticiaForm.js` (ação `restoreBackup`), `src/lib/postsService.js`
    (expor leitura de `content_backup`).
  - **Critério de aceite:** numa matéria já salva 2×, clicar em "Desfazer último
    salvamento", confirmar no diálogo → o corpo no editor e no banco volta a ser a
    versão anterior; um toast confirma. Se `content_backup` for `null`, o botão
    fica desabilitado com tooltip explicativo.
  - **Como verificar:** editar → salvar → editar de novo → salvar → clicar em
    desfazer → conferir na tela e com
    `select left(content,60) from posts where id = <ID>;`.
  - **Risco e reversão:** baixo. Usa `useConfirm` já existente. Reversão =
    `git revert`; a coluna permanece (inofensiva).
  - **Dependências:** **T1.2**.

*Fim de E1:* painel idêntico visualmente, agora com backup automático, botão de
desfazer e sanitização na escrita. `npm run build` verde.

---

### E2 — Editor richtext base (TipTap) com carregamento tardio

*Objetivo da etapa:* substituir o `<textarea>` do corpo pelo editor TipTap, com
toolbar completa e atalhos, mantendo todo o resto do formulário intacto.

- [x] **T2.1 — Instalar as dependências do TipTap**
  - **Objetivo:** adicionar só `StarterKit` + `link` + `image` + `placeholder` e
    os peers, sem uso ainda.
  - **Arquivos:** `package.json`, `package-lock.json`.
  - **Pacotes (TipTap v3.31.3):** `@tiptap/react`, `@tiptap/pm`,
    `@tiptap/starter-kit`, `@tiptap/extension-image`,
    `@tiptap/extension-placeholder`. **Sem** `@tiptap/extension-link` avulso: no
    v3 o `StarterKit` já embute `Link` (`@tiptap/starter-kit` depende dele) e se
    configura via `StarterKit.configure({ link: {...} })` — instalar o pacote à
    parte duplicaria a extensão.
  - **Critério de aceite:** `npm run build` verde; `git diff package.json` mostra
    só esses 6 pacotes adicionados; o bundle **público** (`dist/assets/*`) não
    cresce (o import só entra no chunk do admin, verificado em T2.2).
  - **Como verificar:** `npm ls @tiptap/react @tiptap/starter-kit`; `npm run build`
    e comparar o tamanho dos chunks antes/depois.
  - **Risco e reversão:** baixo. Reversão = `npm remove` dos 6 pacotes +
    `git checkout package*.json`.
  - **Dependências:** nenhuma.

- [x] **T2.2 — Componente `RichTextEditor` carregado sob demanda**
  - **Objetivo:** um editor TipTap (sem toolbar ainda) que recebe `value` (HTML),
    emite `onChange` (HTML via `editor.getHTML()`), com `React.lazy` +
    `Suspense`, substituindo o `<textarea>` do corpo em `NoticiaForm`.
  - **Arquivos:** novo `src/admin/components/RichTextEditor.jsx`; novo
    `src/admin/components/RichTextEditor.lazy.jsx` (wrapper `React.lazy` +
    `Suspense`); `src/admin/components/NoticiaForm.jsx` (troca do campo de
    conteúdo, remove a toolbar/`formatText` antigos); `src/admin/hooks/useNoticiaForm.js`
    (validação de corpo vazio, já que o `required` do `<textarea>` some).
  - **Critério de aceite:** abrir `/admin/noticias/editar/<id>` de uma matéria
    com HTML → o conteúdo aparece renderizado (negrito, listas, parágrafos), é
    editável, e ao salvar o corpo persiste. Enquanto o editor carrega, aparece um
    spinner. O chunk do TipTap só é baixado nessa rota (aba Network: o
    `RichTextEditor` chunk não carrega na Home).
  - **Como verificar:** DevTools → Network → abrir a Home (nenhum chunk TipTap) →
    abrir a rota de edição (chunk TipTap carrega). Editar um parágrafo, salvar,
    recarregar, conferir persistência e com
    `select left(content,80) from posts where id = <ID>;`.
  - **Risco e reversão:** **alto** — é a troca central. Mitigação: manter o campo
    antigo até esta task; reversão = `git revert` da troca em `NoticiaForm`
    (volta ao `<textarea>`); os arquivos novos ficam órfãos, inofensivos. A
    coluna `content_backup` protege contra salvamento ruim.
  - **Dependências:** **T2.1**, **T1.3** (sanitização na escrita já ativa).

- [x] **T2.3 — Barra de ferramentas completa + atalhos**
  - **Objetivo:** toolbar em Bootstrap ligada ao editor: negrito, itálico,
    riscado, H2/H3/H4, lista ordenada/não-ordenada, citação em bloco, link (com
    validação de URL), linha divisória (`<hr>`), limpar formatação (D5),
    desfazer/refazer. Atalhos padrão (`Ctrl/Cmd+B/I`, `Ctrl/Cmd+Z/Shift+Z`).
  - **Arquivos:** `src/admin/components/RichTextEditor.jsx`, novo
    `src/admin/components/RichTextToolbar.jsx`, `src/index.css` (estilos da nova
    toolbar).
  - **Critério de aceite:** cada botão aplica/retira a formatação na seleção e
    reflete o estado ativo (`aria-pressed`). O botão de link abre um campo,
    rejeita entradas sem esquema `http(s):` ou `mailto:` com aviso, e grava
    `<a href rel="noopener noreferrer" target="_blank">`. Salvar e conferir que o
    HTML resultante passa por `sanitizeHtml` sem perda (`select content ...`).
  - **Como verificar:** aplicar cada formato numa matéria de teste, salvar,
    inspecionar `content` no banco e a renderização em `/noticia/<slug>`.
  - **Risco e reversão:** médio. Reversão = `git revert` da task (editor fica sem
    toolbar, ainda usável). 
  - **Dependências:** **T2.2**, **T1.1** (allowlist inclui `hr`, `a` com `rel`).

- [x] **T2.4 — Menu flutuante de seleção (BubbleMenu)**
  - **Objetivo:** ao selecionar texto, aparece um menu compacto com negrito,
    itálico, link e "intertítulo".
  - **Arquivos:** `src/admin/components/RichTextEditor.jsx`, `src/index.css`.
  - **Critério de aceite:** selecionar uma palavra faz o menu aparecer perto da
    seleção; clicar em negrito formata; o menu some ao clicar fora. Não aparece
    quando não há seleção.
  - **Como verificar:** manual na rota de edição, em desktop e numa largura
    mobile (DevTools responsive) — o menu não pode estourar a tela.
  - **Risco e reversão:** baixo. Reversão = `git revert`.
  - **Dependências:** **T2.3**.

- [x] **T2.5 — Compatibilidade com matérias legadas no editor**
  - **Objetivo:** garantir que matérias em HTML antigo **e** em texto puro
    (bloco único) abram no editor sem perda e salvem sem corromper.
  - **Arquivos:** `src/admin/hooks/useNoticiaForm.js` (normalização de entrada:
    se o corpo não tem tag de bloco, envolver em um único `<p>` com `<br>` nas
    quebras, sem tentar detectar intertítulo — isso é a rotina E4).
  - **Critério de aceite:** abrir 3 matérias reais — uma com HTML rico, uma com
    texto puro com parágrafos separados por linha em branco, uma com texto puro
    corrido — todas aparecem legíveis no editor. Salvar **sem editar** não muda
    o corpo de forma destrutiva (diff só de espaços/quebras entre tags,
    verificado com `select content from posts where id = <ID>;` antes/depois).
  - **Como verificar:** escolher 3 ids do acervo, anotar `left(content,120)` de
    cada, abrir, salvar, comparar.
  - **Risco e reversão:** médio (round-trip de HTML no ProseMirror pode
    normalizar tags). Mitigação: `content_backup`. Reversão = `git revert`.
  - **Dependências:** **T2.2**.

- [x] **T2.6 — Layout de escrita** *(inserida por pedido do usuário durante a
  Etapa E2 — não estava no plano original; a página de 3 colunas — nav do
  admin + conteúdo + configurações — prejudicava a imersão na escrita)*
  - **Objetivo:** reformular a disposição da tela para coluna única
    (título + corpo, sem vizinhos), com os campos de metadados (resumo,
    categorias, status, autores, data, imagens) num painel "Detalhes" que
    abre sob demanda — sem alterar nome, comportamento ou lógica de nenhum
    campo (regra "não reorganize os metadados" preservada: só a posição
    visual muda, os campos continuam exatamente os mesmos).
  - **Arquivos:** `src/admin/components/NoticiaForm.jsx` (reestruturado);
    `src/index.css` (`.noticia-editor-*`, `.noticia-details-*`; removidas as
    regras mortas `.admin-editar-noticia .card`/`.card-header`, que não
    existem mais na tela; overrides para a toolbar/popover de link não
    herdarem o tema escuro genérico de input/botão).
  - **Critério de aceite:** ao abrir criar/editar matéria, a tela mostra só
    título (grande, estilo documento) e o editor, numa folha branca
    centralizada — nenhum card de configurações visível. Um botão
    "Detalhes" abre um painel lateral (com Resumo, Categorias, Status,
    Autores, Data, Imagens) por cima do conteúdo, sem empurrar a coluna de
    escrita; `Esc` ou clique fora fecha. Salvar uma matéria de teste com
    campos preenchidos nos dois lugares (título/corpo na página, resto no
    painel) e conferir que tudo persiste normalmente.
  - **Como verificar:** abrir `/admin/noticias/nova`, digitar título e
    corpo, abrir "Detalhes", preencher resumo/categoria/autor, fechar,
    salvar; reabrir e conferir que os dois grupos de campos voltaram
    preenchidos.
  - **Risco e reversão:** médio (reestruturação grande de JSX, mas sem
    tocar em `useNoticiaForm.js`/handlers — só posição visual). Mitigação:
    todos os campos e handlers testados por grep 1:1 contra a versão
    anterior antes do commit. Reversão = `git revert` (volta ao layout de
    2 colunas).
  - **Dependências:** **T2.2** (o editor precisa existir para ocupar a
    coluna principal).

*Fim de E2:* editor TipTap completo no lugar do `<textarea>`, matérias antigas
abrindo e salvando. `npm run build` verde.

---

### E3 — Colar limpo

*Objetivo da etapa:* colar de Word, Google Docs e web sem trazer lixo.

- [ ] **T3.1 — Filtro de colagem**
  - **Objetivo:** ao colar, remover `style=`, `class=` não-permitida, `<span>`
    sem atributos, comentários condicionais do Word (`<!--[if ...]>`), tags
    `<o:p>`/`<w:*>`, atributos `xmlns*`/`lang`/`dir` supérfluos — preservando
    `p`, `h2`–`h4`, `ul/ol/li`, `strong/em`, `a[href]`, `blockquote`.
  - **Arquivos:** `src/admin/components/RichTextEditor.jsx` (opção
    `editorProps.transformPastedHTML` ou `handlePaste`), novo
    `src/lib/pasteClean.js` (função pura, reutiliza a lógica/allowlist de
    `sanitize.js`).
  - **Critério de aceite:** colar um trecho copiado do Word e outro do Google
    Docs → o HTML resultante no editor (e depois salvo) **não contém** `style=`,
    `class=` fora da allowlist, nem `<span>` vazio; títulos do original viram
    `<h2>/<h3>`, listas continuam listas, negrito/itálico preservados.
  - **Como verificar:** colar amostras reais na rota de edição, salvar, rodar
    `select content from posts where id = <ID>;` e conferir com
    `grep -o 'style=\|class="Mso\|<span>\|<o:p>'` na string (deve dar vazio).
  - **Risco e reversão:** médio — filtro agressivo demais remove semântica.
    Mitigação: fixtures em T3.2. Reversão = `git revert` (volta ao paste padrão
    do TipTap, que já é razoável).
  - **Dependências:** **T2.2**, **T1.1**.

- [ ] **T3.2 — Fixtures de colagem versionadas**
  - **Objetivo:** congelar o comportamento com amostras reais de Word, Google
    Docs e uma página web.
  - **Arquivos:** novo `src/lib/__tests__/pasteClean.test.js` (ou
    `scripts/test-paste.mjs`) + `src/lib/__tests__/fixtures/` com 3 HTMLs de
    entrada e os 3 esperados.
  - **Critério de aceite:** rodar o teste imprime PASS para os 3 casos; cada
    esperado é HTML semântico sem `style`/`class` suja/`span` vazio.
  - **Como verificar:** `node scripts/test-paste.mjs` (ou `npm test`).
  - **Risco e reversão:** baixo. Reversão = remover os arquivos de teste.
  - **Dependências:** **T3.1**.

*Fim de E3:* colar de qualquer origem produz HTML limpo. `npm run build` verde.

---

### E4 — Reparar texto puro (sob demanda)

*Objetivo da etapa:* converter uma matéria antiga em bloco único para parágrafos
+ intertítulos, uma de cada vez, sempre com backup antes. Sem lote.

- [ ] **T4.1 — Função `plainTextToHtml`**
  - **Objetivo:** função pura que quebra texto puro em `<p>` (por linha em branco;
    `\n` simples vira espaço ou `<br>` conforme regra) e marca prováveis
    intertítulos como `<h2>` conforme D4.
  - **Arquivos:** novo `src/lib/plainTextToHtml.js` + teste
    `src/lib/__tests__/plainTextToHtml.test.js`.
  - **Critério de aceite:** entrada com 3 parágrafos separados por linha em branco
    e uma linha curta isolada sem pontuação → saída com 3 `<p>` e 1 `<h2>` na
    posição certa. Entrada que já é HTML (tem `<p>`) → retorna igual (no-op).
  - **Como verificar:** rodar o teste; casos PASS/FAIL listados.
  - **Risco e reversão:** baixo (função isolada, sem efeito). Reversão = remover
    o arquivo.
  - **Dependências:** **D4**.

- [ ] **T4.2 — Botão "Reparar texto puro" no editor**
  - **Objetivo:** botão que só aparece quando o corpo não tem tags de bloco;
    grava `content` atual em `content_backup`, aplica `plainTextToHtml`, carrega
    o resultado no editor **sem salvar** (autor revisa e salva).
  - **Arquivos:** `src/admin/components/NoticiaForm.jsx`,
    `src/admin/hooks/useNoticiaForm.js`, `src/lib/postsService.js` (escrever
    `content_backup` sob demanda).
  - **Critério de aceite:** numa matéria de texto puro, o botão aparece; clicar →
    diálogo de confirmação → o editor mostra parágrafos e intertítulos; nada foi
    salvo ainda (recarregar a página sem salvar mantém o original). Após salvar,
    `content_backup` guarda o texto puro anterior e o botão "Desfazer último
    salvamento" (T1.4) restaura. Numa matéria já em HTML, o botão **não** aparece.
  - **Como verificar:** escolher um id de texto puro; anotar
    `left(content,120)`; reparar; conferir a tela; recarregar sem salvar (deve
    voltar ao puro); reparar de novo, salvar, rodar
    `select left(content,120) as novo, left(content_backup,120) as bkp from posts where id = <ID>;`.
  - **Risco e reversão:** médio — conversão pode escolher intertítulos errados.
    Mitigação: não salva sozinha; `content_backup` + botão de desfazer.
    Reversão = `git revert`.
  - **Dependências:** **T4.1**, **T1.2**, **T1.4**, **T2.2**.

*Fim de E4:* reparo de texto puro disponível, uma matéria por vez, reversível.
Sem execução em lote nem opção escondida. `npm run build` verde.

---

### E5 — Elementos jornalísticos no corpo

*Objetivo da etapa:* inserir intertítulo, olho, boxe, crédito de foto e nota do
editor como marcação semântica no corpo.

- [ ] **T5.1 — Nodes/estilos TipTap para os elementos**
  - **Objetivo:** definir no editor os elementos de D1 (olho, boxe, crédito, nota
    do editor; intertítulo já é H2/H3), cada um com sua marcação semântica.
  - **Arquivos:** novo `src/admin/components/tiptap/journalismNodes.js`,
    `src/admin/components/RichTextEditor.jsx`.
  - **Critério de aceite:** inserir cada elemento produz exatamente a marcação de
    D1; o `getHTML()` reflete isso; salvar e conferir com
    `select content from posts where id = <ID>;`.
  - **Como verificar:** inserir os 5 elementos numa matéria de teste, salvar,
    inspecionar o HTML no banco.
  - **Risco e reversão:** médio. Reversão = `git revert` (elementos somem da
    toolbar; HTML já salvo permanece válido e é renderizado pelo CSS de T5.3).
  - **Dependências:** **D1**, **T2.3**.

- [ ] **T5.2 — UI de inserção dos elementos**
  - **Objetivo:** dropdown "Inserir" (D6) na toolbar com os 5 elementos.
  - **Arquivos:** `src/admin/components/RichTextToolbar.jsx`, `src/index.css`.
  - **Critério de aceite:** cada item do menu insere o elemento no ponto do
    cursor; navegável por teclado; `aria-label` em cada opção.
  - **Como verificar:** manual, com mouse e com teclado (Tab/Enter/Esc).
  - **Risco e reversão:** baixo. Reversão = `git revert`.
  - **Dependências:** **T5.1**, **D6**.

- [ ] **T5.3 — CSS dos elementos no editor e no público**
  - **Objetivo:** estilo visual de olho/boxe/crédito/nota do editor, reutilizado
    em `.article-content` (público) e no editor.
  - **Arquivos:** `src/index.css` (bloco novo perto de `.article-content`).
  - **Critério de aceite:** uma matéria com os 5 elementos renderiza em
    `/noticia/<slug>` com destaque visual coerente com a identidade do site; o
    mesmo no preview do editor (E7/T7.4).
  - **Como verificar:** abrir a matéria de teste no site e no preview; comparar.
  - **Risco e reversão:** baixo (CSS aditivo, classes novas). Reversão =
    `git revert`.
  - **Dependências:** **T5.1**.

- [ ] **T5.4 — Allowlist para os elementos jornalísticos**
  - **Objetivo:** garantir que `aside`, as classes de D1 e `figcaption.credito`
    passem por `sanitizeHtml`, e que classes fora do conjunto sejam removidas.
  - **Arquivos:** `src/lib/sanitize.js`, teste de T1.1 ampliado.
  - **Critério de aceite:** HTML com os 5 elementos + um `<aside class="hack">`
    → saída mantém os 5 e remove a classe `hack` (vira `<aside>` sem classe ou é
    removido, conforme a regra escolhida).
  - **Como verificar:** rodar o teste de sanitização.
  - **Risco e reversão:** baixo. Reversão = `git revert`.
  - **Dependências:** **T5.1**, **T1.1**.

*Fim de E5:* elementos jornalísticos inseríveis, estilizados e sanitizados.
`npm run build` verde.

---

### E6 — Imagens e mídia no corpo

*Objetivo da etapa:* inserir imagem no corpo (upload ou URL) com alt obrigatório,
legenda e crédito, como `<figure>` no HTML — **sem tocar no array `images`**.

- [ ] **T6.1 — Inserir imagem por URL no corpo**
  - **Objetivo:** diálogo com campos URL, texto alternativo (obrigatório),
    legenda, crédito → insere `<figure><img src alt><figcaption>legenda —
    crédito</figcaption></figure>` no cursor.
  - **Arquivos:** `src/admin/components/RichTextEditor.jsx`, novo
    `src/admin/components/tiptap/FigureImage.js` (extensão baseada em
    `@tiptap/extension-image` com `figure`+`figcaption`).
  - **Critério de aceite:** sem preencher o alt, o botão "Inserir" fica
    desabilitado com aviso. Com tudo preenchido, a figura aparece no editor e,
    após salvar, o HTML no banco tem `<figure><img alt="...">...<figcaption>`.
    A query `select images from posts where id = <ID>;` **não muda**.
  - **Como verificar:** inserir uma imagem por URL, salvar, comparar `images`
    (igual) e `content` (com a figura) no banco; abrir `/noticia/<slug>`.
  - **Risco e reversão:** médio. Reversão = `git revert` (figuras já salvas
    continuam válidas — `<figure>` está na allowlist por E1).
  - **Dependências:** **T2.3**, **T1.1**.

- [ ] **T6.2 — Upload de imagem para o corpo**
  - **Objetivo:** no mesmo diálogo, opção de enviar arquivo → reutiliza
    `uploadImage` do hook (bucket `noticias-imagens`), devolve a URL pública e
    insere a `<figure>`.
  - **Arquivos:** `src/admin/hooks/useNoticiaForm.js` (expor `uploadImage`
    isolado), `src/admin/components/RichTextEditor.jsx`.
  - **Critério de aceite:** enviar um JPG → barra/spinner de progresso → a figura
    aparece com a URL do Storage; alt continua obrigatório; `images` no banco
    intacto após salvar.
  - **Como verificar:** upload numa matéria de teste, salvar, conferir `content`
    (URL do Storage dentro de `<figure>`) e `images` (inalterado).
  - **Risco e reversão:** médio (reaproveitamento do upload). Reversão =
    `git revert`.
  - **Dependências:** **T6.1**.

- [ ] **T6.3 — Incorporar vídeo/posts por URL** — ⏸️ **adiada (D2)**, ver §5.

- [ ] **T6.4 — Formatação customizada da imagem no corpo (D7)**
  - **Objetivo:** controlar alinhamento e tamanho da `<figure>` no corpo, via
    menu contextual ao selecionar a imagem no editor.
  - **Arquivos:** `src/admin/components/tiptap/FigureImage.js` (atributos
    `align`/`size` → classes), `src/admin/components/RichTextEditor.jsx` (controle
    de imagem selecionada), `src/lib/sanitize.js` (allowlist das classes),
    `src/index.css` (regras no editor e em `.article-content`).
  - **Opções (confirmar no início da tarefa):** alinhamento esquerda / centro /
    direita / largura plena; tamanho pequena ≈ 320 px / média ≈ 480 px / grande =
    largura da coluna / plena. Classes na `<figure>`, ex.: `fig-esq fig-media`.
  - **Critério de aceite:** selecionar uma imagem no editor mostra os controles;
    escolher "direita + média" grava `<figure class="fig-dir fig-media">` (via
    `select content from posts where id = <ID>;`); a mesma matéria em
    `/noticia/<slug>` exibe a imagem alinhada à direita, ~480 px, com o texto
    fluindo ao lado; classe fora do conjunto é removida por `sanitizeHtml`.
  - **Como verificar:** aplicar 2–3 combinações numa matéria de teste, salvar,
    conferir `content` no banco e o resultado no site e no preview.
  - **Risco e reversão:** médio (CSS de *float* + *full-bleed* pode brigar com o
    layout de coluna). Mitigação: presets fixos, sem valores livres. Reversão =
    `git revert` (figuras voltam ao padrão centralizado; HTML salvo continua
    válido).
  - **Dependências:** **T6.1**, **T1.1**.

*Fim de E6:* imagem no corpo com metadados obrigatórios e formatação (alinhamento
+ tamanho). Embed adiado. Array `images` e galeria da sidebar inalterados.
`npm run build` verde.

---

### E7 — Fluxo de escrita e pré-visualização

*Objetivo da etapa:* autosave, aviso de não salvo, métricas de texto, preview
fiel e modo foco.

- [ ] **T7.1 — Autosave local de rascunho + indicador de estado**
  - **Objetivo:** salvar o rascunho em `localStorage` (D3) a cada ~5 s quando há
    alteração; indicador "salvando…", "salvo às HH:MM", "erro ao salvar". Ao
    reabrir a matéria, oferecer recuperar o rascunho local mais novo que o banco.
  - **Arquivos:** novo `src/admin/hooks/useLocalDraft.js`,
    `src/admin/components/NoticiaForm.jsx`, `src/admin/hooks/useNoticiaForm.js`.
  - **Critério de aceite:** editar o corpo, esperar 5 s → indicador mostra "salvo
    às HH:MM"; recarregar a página (sem salvar no banco) → aparece "recuperar
    rascunho não salvo"; aceitar restaura o texto; recusar mantém o do banco e
    limpa o rascunho local.
  - **Como verificar:** DevTools → Application → Local Storage (chave por id);
    editar, recarregar, testar os dois caminhos.
  - **Risco e reversão:** baixo (só client-side). Reversão = `git revert`;
    limpar `localStorage` não é necessário (chave própria).
  - **Dependências:** **D3**, **T2.2**.

- [ ] **T7.2 — Aviso de alterações não salvas**
  - **Objetivo:** `beforeunload` + bloqueio de navegação do React Router
    (`useBlocker`) quando há alteração não salva no banco.
  - **Arquivos:** `src/admin/components/NoticiaForm.jsx`,
    `src/admin/hooks/useNoticiaForm.js` (flag `dirty`).
  - **Critério de aceite:** com alteração pendente, fechar a aba pede confirmação
    do navegador; clicar em "Cancelar"/"Voltar para o site" dentro da SPA abre um
    diálogo (`useConfirm`) antes de sair. Após salvar, sair não pede nada.
  - **Como verificar:** editar → tentar navegar para `/admin/noticias` → diálogo;
    salvar → navegar → sem diálogo.
  - **Risco e reversão:** baixo. Reversão = `git revert`.
  - **Dependências:** **T2.2**.

- [ ] **T7.3 — Contador de palavras e tempo de leitura**
  - **Objetivo:** rodapé do editor com nº de palavras e minutos estimados
    (`palavras / 200`, mesma fórmula de `src/pages/Noticia.jsx`).
  - **Arquivos:** `src/admin/components/RichTextEditor.jsx` ou `NoticiaForm.jsx`,
    reutilizando `stripHtml` de `src/utils/textUtils.js`.
  - **Critério de aceite:** o contador acompanha a digitação; para uma matéria
    conhecida, o nº de minutos bate com o exibido em `/noticia/<slug>`.
  - **Como verificar:** abrir a mesma matéria no editor e no site, comparar.
  - **Risco e reversão:** baixo. Reversão = `git revert`.
  - **Dependências:** **T2.2**.

- [ ] **T7.4 — Pré-visualização fiel (mesmo pipeline do público)**
  - **Objetivo:** extrair de `src/pages/Noticia.jsx` o trecho que renderiza o
    corpo (`processHtmlContent` → `sanitizeHtml` → `dangerouslySetInnerHTML` com
    `.article-content`) para um componente compartilhado, e usá-lo no preview do
    editor. Sem renderização paralela.
  - **Arquivos:** novo `src/components/ArticleBody.jsx`;
    `src/pages/Noticia.jsx` (passa a usar `ArticleBody`);
    `src/admin/components/NoticiaForm.jsx` (aba/painel "Pré-visualizar").
  - **Critério de aceite:** o HTML renderizado no preview é idêntico ao de
    `/noticia/<slug>` para a mesma matéria (mesma marcação, mesma tipografia,
    mesmos elementos jornalísticos). `Noticia.jsx` continua funcionando igual
    (diff visual nulo).
  - **Como verificar:** abrir `/noticia/<slug>` e o preview lado a lado; comparar
    o DOM de `.article-content` (deve ser o mesmo após sanitização).
  - **Risco e reversão:** médio — mexe numa página pública. Mitigação: refactor
    sem mudança de comportamento, testado contra a página atual. Reversão =
    `git revert` (restaura o render inline em `Noticia.jsx`).
  - **Dependências:** **T2.2**, **T1.1**, e idealmente **E5** (para o preview
    cobrir os elementos jornalísticos).

- [ ] **T7.5 — Modo foco**
  - **Objetivo:** alternar um modo que esconde a sidebar de configurações e
    centraliza o corpo.
  - **Arquivos:** `src/admin/components/NoticiaForm.jsx`, `src/index.css`.
  - **Critério de aceite:** o botão de modo foco esconde a coluna da direita e
    alarga o editor; sair restaura; o estado não interfere no salvamento.
  - **Como verificar:** manual, desktop e mobile.
  - **Risco e reversão:** baixo. Reversão = `git revert`.
  - **Dependências:** **T2.2**.

*Fim de E7:* escrita protegida contra perda, com métricas, preview fiel e modo
foco. `npm run build` verde.

---

### E8 — Qualidade, acessibilidade e limpeza

*Objetivo da etapa:* fechar erro/loading/vazio, acessibilidade, responsividade e
remover código morto.

- [ ] **T8.1 — Tratamento de erro em toda operação de banco/Storage**
  - **Objetivo:** `load`, `save`, `upload`, `restoreBackup`, `reparar` e autosave
    tratam falha com toast claro e estado recuperável (sem tela travada).
  - **Arquivos:** `src/admin/hooks/useNoticiaForm.js`,
    `src/admin/components/RichTextEditor.jsx`, `src/lib/postsService.js`.
  - **Critério de aceite:** simular falha (offline no DevTools) em cada operação →
    aparece toast de erro, o editor continua utilizável, nenhum dado é perdido.
  - **Como verificar:** DevTools → Network → Offline; executar cada ação.
  - **Risco e reversão:** baixo. Reversão = `git revert`.
  - **Dependências:** E1–E7 no ar.

- [ ] **T8.2 — Estados de carregamento e vazio**
  - **Objetivo:** skeleton/spinner enquanto o editor carrega; estado "matéria
    sem corpo" com placeholder amigável.
  - **Arquivos:** `src/admin/components/NoticiaForm.jsx`,
    `src/admin/components/RichTextEditor.jsx`.
  - **Critério de aceite:** abrir a rota de edição em rede lenta (throttling)
    mostra o carregamento sem "pulo" de layout; matéria nova mostra o placeholder
    do editor.
  - **Como verificar:** DevTools → Network → Slow 3G; abrir edição e "nova".
  - **Risco e reversão:** baixo. Reversão = `git revert`.
  - **Dependências:** **T2.2**.

- [ ] **T8.3 — Acessibilidade do editor**
  - **Objetivo:** `role="toolbar"` com navegação por setas, `aria-pressed` nos
    botões de marca, `aria-label` em todos, foco visível, ordem de tabulação sã,
    `Esc` fecha diálogos do editor (link, inserir, imagem).
  - **Arquivos:** `src/admin/components/RichTextToolbar.jsx`,
    `src/admin/components/RichTextEditor.jsx`, `src/index.css`.
  - **Critério de aceite:** dá para aplicar negrito, criar link e inserir
    intertítulo **só com teclado**; foco sempre visível; leitor de tela anuncia o
    estado dos botões. `axe` (DevTools) sem violações críticas no editor.
  - **Como verificar:** navegação só por teclado + extensão axe/Lighthouse a11y.
  - **Risco e reversão:** baixo. Reversão = `git revert`.
  - **Dependências:** **T2.3**, **T5.2**.

- [ ] **T8.4 — Layout responsivo do editor**
  - **Objetivo:** toolbar que quebra sem estourar, coluna única no mobile,
    BubbleMenu e diálogos utilizáveis em telas pequenas.
  - **Arquivos:** `src/index.css`, `src/admin/components/NoticiaForm.jsx`.
  - **Critério de aceite:** em 360 px de largura, a toolbar não gera scroll
    horizontal, todos os botões são alcançáveis, o editor ocupa a largura total.
  - **Como verificar:** DevTools responsive em 360/768/1024 px.
  - **Risco e reversão:** baixo (CSS). Reversão = `git revert`.
  - **Dependências:** **T2.3**.

- [ ] **T8.5 — Remover CSS e imports mortos**
  - **Objetivo:** apagar `.tiptap-editor-wrapper` e `.editor-toolbar` de
    `src/index.css` se não reaproveitados, e imports não usados (`FaLink` etc.).
  - **Arquivos:** `src/index.css`, `src/admin/components/NoticiaForm.jsx`.
  - **Critério de aceite:** `npm run lint` sem avisos de import não usado no
    fluxo; `grep -n "tiptap-editor-wrapper\|editor-toolbar" src/index.css` só
    retorna o que o editor novo realmente usa (ou nada).
  - **Como verificar:** `npm run lint` + `npm run build` + smoke test do editor.
  - **Risco e reversão:** baixo. Reversão = `git revert`.
  - **Dependências:** **E2**–**E7** concluídas (para saber o que sobra).

*Fim de E8:* editor tratado para erro, acessível, responsivo e sem código morto.
`npm run build` verde.

---

## 4. Alteração de schema (única, aprovada)

| Item | SQL de criação | SQL de reversão |
|---|---|---|
| `content_backup` (T1.2) | `alter table public.posts add column if not exists content_backup text;` | `alter table public.posts drop column if exists content_backup;` |

Coluna `text`, nullable, sem default, sem constraint. Nenhuma outra alteração de
schema será feita sem consulta.

---

## 5. Dívida técnica conhecida (fora de escopo — não tocar nesta rodada)

- **`slug` e sua regeneração:** `savePost` faz `slug = slugify(title)` em todo
  salvamento; renomear matéria publicada muda o slug e quebra links/RSS/sitemap.
  Não há checagem de unicidade (`getPostBySlug` usa `.single()`).
- **`published_at` é `text`, não `timestamptz`:** ordenação
  `.order('published_at')` é lexicográfica; só funciona porque as datas novas são
  ISO 8601. `<input type="date">` perde a hora e sofre *off-by-one* de fuso.
- **`status` sem gate:** `text` livre, sem default nem constraint; 127/128
  matérias são `draft` e mesmo assim públicas. Status não controla publicação.
- **Colunas legadas duplicadas:** `published` e `updated` (`text`) coexistem com
  `published_at`/`updated_at` (`timestamptz`); os leitores fazem *fallback* entre
  elas.
- **`getAllPosts()` na listagem (`AdminNoticias`):** traz o corpo inteiro de
  128+ matérias, sem paginação nem busca.
- **`updated_at` gravado e nunca lido:** não há detecção de concorrência; dois
  editores = o último salva por cima.
- **Colunas de corpo dobradas:** `content` + `text_content` gravadas em
  sincronia por `savePost` — mantido de propósito (regra 7), mas é acoplamento a
  ser resolvido numa consolidação futura.
- **Embed de vídeo/posts por URL (D2):** adiado. Quando entrar, decidir entre
  `<iframe>` de domínios permitidos (mais fiel, mais superfície de segurança) ou
  card com link (mais seguro). Exigirá revisar `src/lib/sanitize.js`.
- **Suíte de testes automatizada:** `scripts/test-sanitize.mjs` (e as futuras de
  E3/E4) precisam de um DOM no Node. Sem `jsdom` instalado, os scripts saem com
  aviso (exit 0) e a verificação é manual no navegador.

---

## 6. Registro de progresso

| Data | Etapa/Tarefa | Commit | Observações |
|------|--------------|--------|-------------|
| 2026-09-04 | Fase 0 + Plano | — | Diagnóstico e schema real (`information_schema`) conferidos; `PLANO_PAINEL.md` criado. Aguardando aprovação e respostas a D1–D6. |
| 2026-09-04 | E1 · T1.2 | a4acec6 | `scripts/sql/2026-09-04-content-backup.sql` (criação + reversão). `savePost` passa a copiar `content` atual para `content_backup` antes de todo UPDATE (best-effort: se a coluna não existir, segue sem o backup e só loga um warning). Build verde (149 módulos). SQL aplicado no Supabase pelo usuário. |
| 2026-09-04 | Decisões D1–D7 | — | D1 aprovado (marcação dos elementos). D2 adiado (embed → §5). D3 `localStorage`. D4/D5/D6 aprovados. D7 novo: formatação customizada de imagem no corpo → E6/T6.4. |
| 2026-09-04 | E1 · T1.1 | c6897f2 | `src/lib/sanitize.js`: hook `afterSanitizeAttributes` filtra `class` contra allowlist fixa (`olho`, `boxe`, `nota-editor`, `credito`); `FORBID_ATTR` ganhou `srcset`; comentários atualizados (a função agora vale para escrita + leitura). `scripts/test-sanitize.mjs` com 5 casos (roda com `jsdom`; sem ele, sai com aviso). Build verde. Lint sem regressão nos arquivos tocados. |
| 2026-09-04 | E1 · T1.3 | ae529ea | `savePost` (`src/lib/postsService.js`) passa o corpo por `sanitizeHtml` antes de gravar `content`/`text_content`. Texto puro sem tags passa intacto; HTML fora da allowlist é limpo na escrita. `content_backup` (T1.2) é a rede de segurança. Build verde; lint limpo nos arquivos tocados. |
| 2026-09-04 | E1 · T1.4 | be9d15c | Botão "Desfazer último salvamento" (só no modo edição) em `NoticiaForm.jsx`. `useNoticiaForm`: `restoreBackup` (confirma → lê `content_backup` fresco → restaura no corpo e persiste) + `backupAvailable` (do load; desabilita o botão quando não há backup). `submit` refatorado com `buildPayload` compartilhado. Funciona como alternância (o `savePost` grava o corpo de agora como novo backup). Build verde; lint limpo. **Fim da Etapa E1.** |
| 2026-09-04 | E1 aprovada; início de E2 | — | Usuário aprovou E1 sem instalar `jsdom` por ora. |
| 2026-09-04 | E2 · T2.1 | 9d603ca | Instalado TipTap **v3.31.3**: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-placeholder` (5 pacotes; `extension-link` ficou de fora — o v3 já embute Link no StarterKit, configurável via `StarterKit.configure({ link: {...} })`). `BubbleMenu`/`FloatingMenu` (T2.4) também já vêm via `@tiptap/react/menus`, sem pacote extra. `npm audit`: 18 vulnerabilidades, todas pré-existentes em deps transitivas do projeto (vite/react-router/eslint/etc.), nenhuma em `@tiptap/*` — não mexidas (fora de escopo). Build verde, bundle público idêntico (nada importado ainda). |
| 2026-09-04 | E2 · T2.2 | 2afe636 | `src/admin/components/RichTextEditor.jsx` (TipTap: StarterKit+Image+Placeholder, controlado por `value`/`onChange`) + `RichTextEditor.lazy.jsx` (`React.lazy`+`Suspense`, arquivo separado do `.jsx` real). `NoticiaForm.jsx`: removidos `formatText`/`contentRef`/toolbar antiga e o `<textarea>`; entra o editor novo. `useNoticiaForm`: validação de corpo vazio no `submit` (o `required` do textarea sumiu). CSS novo `.richtext-editor*` em `index.css` (o `.editor-toolbar` antigo fica para a limpeza de T8.5). **Build confirma o code-splitting sozinho:** chunk `RichTextEditor-*.js` (408 kB / 129 kB gzip) separado de `index-*.js` — só carrega nas rotas do admin que montam o editor. Build e lint verdes. **Verificação em tela pendente do usuário** (sem `.env`/Supabase neste ambiente): abrir uma matéria com HTML e uma em texto puro em `/admin/noticias/editar/:id`, conferir que o corpo aparece e edita, e que salvar persiste. |
| 2026-09-04 | E2 · T2.3 | 23cfb42 | `src/admin/components/RichTextToolbar.jsx`: negrito, itálico, riscado, H2/H3/H4, listas, citação, link (popover com validação http(s)/mailto + remover), linha divisória, limpar formatação (D5: só marcas inline + rebaixa heading), desfazer/refazer. Estado ativo via `useEditorState` (re-renderiza em toda mudança de seleção/transação, não só no conteúdo). Atalhos de teclado vêm de graça do StarterKit (Mod-b/i, Mod-z/y, etc.). CSS novo em `index.css`. **Nota honesta sobre bundle:** o chunk `RichTextEditor-*.js` cresceu (+4 kB) como esperado; o chunk **principal** também cresceu uns 7 kB — não por causa do TipTap (a toolbar não é importada fora do lazy), mas porque `NoticiaForm.jsx` (não lazy) já importava `react-icons/fa`, e a toolbar importou mais ícones desse mesmo módulo; o Rollup preferiu não duplicar o módulo entre os dois chunks. A app inteira (inclusive as telas do admin) já ia num bundle só antes desta etapa — só o pedaço do TipTap ficou isolado, que era o objetivo. Build e lint verdes. |
| 2026-09-04 | **Push para `origin/main`** | 23cfb42 | Usuário perguntou se o site estava sendo atualizado — não estava (6 commits só locais). Empurrado tudo (`641eabe..23cfb42`). **E2 foi ao ar pela metade** (T2.4/T2.5 ainda não feitas nem testadas em tela); usuário avisado e pediu para confirmar no ambiente dele. |
| 2026-09-04 | E2 · T2.4 | e53347f | `RichTextBubbleMenu.jsx`: menu flutuante ao selecionar texto — negrito, itálico, intertítulo (H2), link. `ToolbarButton`/`LinkControl` de T2.3 ganharam prop `variant` ("toolbar" claro / "bubble" escuro flutuante) para serem reaproveitados aqui. `@tiptap/extension-bubble-menu` + `@floating-ui/*` já vieram como `optionalDependencies` de `@tiptap/react` (nenhum pacote novo instalado). CSS novo. Chunk `RichTextEditor-*.js` cresceu para 467.69 kB / 147.62 kB gzip (floating-ui é pesado) — isolado do público, só usado no admin. Build e lint verdes. |
| 2026-09-04 | E2 · T2.5 | 099c41d | **Achado real, corrigido:** sem essa tarefa, o editor quebrava justamente as matérias em texto puro (a maioria do acervo) — o parser de HTML do ProseMirror colapsa `\n` (regra de espaço em branco do HTML), então um texto com parágrafos separados por linha em branco viraria um bloco só, sem quebra nenhuma. `toFormState` e o `restoreBackup` (T1.4) agora passam o corpo por `processHtmlContent` — a mesma função que o `Noticia.jsx` público já usa — antes de entregá-lo ao editor: texto puro ganha `<br>` explícito; HTML já estruturado só perde indentação (idempotente, sem mudar o conteúdo visível). Testado isoladamente em Node (função pura, sem DOM): `"a\n\nb\nc"` → `"a<br><br>b<br>c"`; `"<p>x</p>\n<p>y</p>"` → `"<p>x</p><p>y</p>"`. Build e lint verdes. |
| 2026-09-04 | E2 · T2.6 (fora do plano original) | 23ad191 | Usuário pediu para reformular a disposição — 3 colunas prejudicava a imersão na escrita. `NoticiaForm.jsx` reestruturado: topbar fixa (Cancelar, Ver o site, Desfazer, **Detalhes**, Salvar) + página branca centralizada (título grande estilo documento + editor, folha de "papel" sobre o admin escuro, tipografia igual à pública) + painel "Detalhes" (resumo, categorias, status, autores, data, imagens) que desliza por cima, sem empurrar a escrita. Nenhum campo, handler ou comportamento mudou — só a posição (conferido campo a campo por grep contra a versão anterior). CSS novo em `index.css`; removidas as regras `.admin-editar-noticia .card`/`.card-header` (não existem mais na tela) e adicionados overrides para a toolbar/popover de link não herdarem o tema escuro genérico de input/botão (o editor senta sobre a folha branca, não sobre o admin escuro). Build e lint verdes. **Fim da Etapa E2.** |
| 2026-09-04 | **Bugfix em produção** (T2.2) | efe0e09 | Usuário reportou crash em produção logo após testar: `TypeError: can't access property "cached", e is null` em `fromSchema`, vindo de `getHTML()` chamado de dentro do `useEffect` de sincronização de `RichTextEditor.jsx` — sem error boundary, derrubava a tela inteira. Causa: o efeito comparava `value !== editor.getHTML()` a cada render para decidir se ressincroniza; chamar um método do editor de forma reativa é arriscado (o editor pode estar sendo destruído/recriado nesse instante — ex.: navegar para fora da tela — e a chamada quebra com schema nulo). **Corrigido**: o efeito agora usa uma `ref` (`isInternalUpdate`) para saber se a mudança de `value` veio do próprio editor (digitação normal → pula a ressincronização) ou de fora (trocar de matéria, desfazer, reparar texto puro → ressincroniza via `setContent`, sem nunca chamar `getHTML()` reativamente); guardas `editor.isDestroyed` em todos os pontos de risco. Build e lint verdes. |
| 2026-09-04 | **🔴 Relato: salvar não muda o conteúdo visível** | — | Usuário: "atualizei e nada [mudou]". Pedido diagnóstico (query SQL de `updated_at`/`content` + checagem do Console do navegador) — resposta ainda não chegou nesta sessão. Hipóteses: (a) cache do snapshot público (~2 min, pré-existente) ou (b) bug real nos dois `UPDATE`s sequenciais que T1.2 adicionou a `savePost`. **Sessão pausada a pedido do usuário antes de confirmar qual é.** Ver seção 0 (topo do arquivo) para retomar. **Não iniciar E3 até isso ser resolvido.** |

---

## 7. Fechamento (preencher ao fim da Fase 2)

- O que ficou de fora:
- O que virou dívida técnica nova:
- O que depende de decisão sua:
