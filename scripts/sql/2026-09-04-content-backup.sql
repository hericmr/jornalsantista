-- T1.2 — Rede de segurança do corpo da matéria (PLANO_PAINEL.md, Etapa E1)
--
-- Adiciona `posts.content_backup`: uma cópia do corpo anterior da matéria,
-- gravada pelo `savePost` (src/lib/postsService.js) antes de cada UPDATE.
-- Coluna aditiva, nullable, sem default, sem constraint — não afeta nenhum
-- leitor existente.
--
-- Aplicar no SQL editor do Supabase ANTES de publicar o código desta tarefa.
-- (O código é best-effort: se a coluna não existir, o salvamento segue sem o
-- backup, sem quebrar.)

alter table public.posts
  add column if not exists content_backup text;

-- --------------------------------------------------------------------------
-- Reversão:
--
-- alter table public.posts
--   drop column if exists content_backup;
