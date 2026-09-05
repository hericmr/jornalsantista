-- Vídeos como posts: permite ao admin publicar um vídeo do YouTube usando o
-- mesmo fluxo de matérias (posts), aparecendo no feed e na home como um post
-- normal.
--
-- Adiciona `posts.video_url`: URL do vídeo (YouTube). Coluna aditiva,
-- nullable, sem default — não afeta nenhuma matéria existente. Quando
-- presente, o frontend (src/lib/video.js) extrai o ID e usa a miniatura do
-- YouTube como capa e o player embutido na página da matéria.
--
-- Aplicar no SQL editor do Supabase antes de publicar o código desta tarefa.

alter table public.posts
  add column if not exists video_url text;

-- --------------------------------------------------------------------------
-- Reversão:
--
-- alter table public.posts
--   drop column if exists video_url;
