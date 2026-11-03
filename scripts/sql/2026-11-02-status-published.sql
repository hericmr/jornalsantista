-- Status das matérias passa a valer no site público.
--
-- Até aqui o site ignorava `posts.status` e publicava tudo; o formulário do
-- admin grava "draft" por padrão, então 126 das 130 matérias no ar estão como
-- rascunho. O código desta tarefa passa a mostrar só `status = 'published'`,
-- e por isso as matérias que já estão no ar precisam ser marcadas antes.
--
-- Marca como publicadas todas as que têm corpo. As que não têm texto nenhum
-- (hoje são 2, páginas vazias) ficam como rascunho e saem do site.
--
-- Aplicar no SQL editor do Supabase ANTES de publicar o código desta tarefa;
-- na ordem inversa o site fica só com as 4 matérias já publicadas até o
-- próximo deploy.

-- guarda o status atual para poder reverter
create table if not exists public.posts_status_backup_20261102 as
  select id, status from public.posts;
-- sem policies: a API pública (anon) não enxerga a tabela de backup
alter table public.posts_status_backup_20261102 enable row level security;

update public.posts
   set status = 'published'
 where status is distinct from 'published'
   and coalesce(nullif(btrim(content), ''), nullif(btrim(text_content), '')) is not null;

-- conferência: deve sobrar só o que é rascunho de verdade
select id, title, status from public.posts where status is distinct from 'published';

-- --------------------------------------------------------------------------
-- Reversão:
--
-- update public.posts p
--    set status = b.status
--   from public.posts_status_backup_20261102 b
--  where b.id = p.id;
-- drop table public.posts_status_backup_20261102;
