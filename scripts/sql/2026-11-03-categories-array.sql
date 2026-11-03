-- Categorias como array jsonb de verdade.
--
-- As matérias importadas do Blogger (126 das 130) guardam `posts.categories`
-- como uma string jsonb com o array dentro ("[\"Política\"]"), não como
-- array. Por isso o filtro por editoria (`categories @> '["Política"]'`) só
-- encontra as matérias novas e a lista de editorias do site sai vazia.
--
-- 1. Converte a string em array (e um texto solto vira array de um item).
-- 2. Unifica grafias: "opinião" -> "Opinião", "Ciencia" -> "Ciência";
--    tira espaços nas pontas e repetições, mantendo a ordem (a primeira
--    categoria é o chapéu do card).
--
-- Pode rodar antes ou depois do deploy do código desta tarefa; o código lida
-- com os dois formatos.

-- guarda as categorias atuais para poder reverter
create table if not exists public.posts_categories_backup_20261103 as
  select id, categories from public.posts;
-- sem policies: a API pública (anon) não enxerga a tabela de backup
alter table public.posts_categories_backup_20261103 enable row level security;

-- 1. string -> array
update public.posts
   set categories = case
         when btrim(categories #>> '{}') like '[%' then (categories #>> '{}')::jsonb
         when btrim(categories #>> '{}') = '' then '[]'::jsonb
         else jsonb_build_array(btrim(categories #>> '{}'))
       end
 where jsonb_typeof(categories) = 'string';

-- 2. grafias e repetições
update public.posts p
   set categories = (
         select coalesce(jsonb_agg(x.name order by x.pos), '[]'::jsonb)
           from (
             select case btrim(e.name)
                      when 'opinião' then 'Opinião'
                      when 'Ciencia' then 'Ciência'
                      else btrim(e.name)
                    end as name,
                    min(e.pos) as pos
               from jsonb_array_elements_text(p.categories) with ordinality as e(name, pos)
              where btrim(e.name) <> ''
              group by 1
           ) x
       )
 where jsonb_typeof(p.categories) = 'array'
   and jsonb_array_length(p.categories) > 0;

-- conferência: não deve sobrar nenhuma string
select jsonb_typeof(categories) as tipo, count(*) from public.posts group by 1;

-- --------------------------------------------------------------------------
-- Reversão:
--
-- update public.posts p
--    set categories = b.categories
--   from public.posts_categories_backup_20261103 b
--  where b.id = p.id;
-- drop table public.posts_categories_backup_20261103;
