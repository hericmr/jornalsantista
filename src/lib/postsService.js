import { postsAPI } from './supabase';
import { supabase } from './supabase';
import { slugify } from '../utils/textUtils';
import { resolvePostImages } from './images';
import { sanitizeHtml } from './sanitize';

// Normaliza um registro do Supabase para o formato usado pelo frontend.
const mapPost = (post) => ({
  ...post,
  source: 'supabase',
  text_content: post.content || post.text_content || '',
  published: post.published || post.published_at,
  title: post.title || 'Título não disponível',
  author: post.author || 'Autor não informado',
  categories: post.categories || [],
  images: resolvePostImages(post.images),
  slug: post.slug || slugify(post.title || String(post.id || ''))
});

// ---- Snapshot estático de conteúdo (public/data/*, gerado no build) ----
// É só uma otimização: se qualquer parte falhar, quem chama cai no Supabase.

let staticIndexPromise;

// Lê e ordena o índice do snapshot (mais recente primeiro; sem data no fim).
// Cacheado por sessão. Retorna null se o snapshot não existir.
const loadStaticIndex = () => {
  if (staticIndexPromise === undefined) {
    staticIndexPromise = fetch('/data/index.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((rows) => {
        if (!Array.isArray(rows)) return null;
        return [...rows].sort(
          (a, b) =>
            new Date(b.published_at || 0) - new Date(a.published_at || 0)
        );
      })
      .catch(() => null);
  }
  return staticIndexPromise;
};

// Busca uma matéria do snapshot pelo slug. Retorna null se indisponível.
const fetchStaticPost = async (slug) => {
  try {
    const res = await fetch(`/data/posts/${encodeURIComponent(slug)}.json`);
    if (!res.ok) return null;
    const post = await res.json();
    return post && post.id ? post : null;
  } catch {
    return null;
  }
};

// Carrega todos os posts, ordenados do mais recente para o mais antigo.
export const getAllPosts = async () => {
  try {
    const posts = await postsAPI.getAllPosts();
    if (!posts || posts.length === 0) return [];

    return posts
      .map(mapPost)
      .sort((a, b) => {
        const dateA = new Date(a.published || a.published_at || 0);
        const dateB = new Date(b.published || b.published_at || 0);
        return dateB - dateA;
      });
  } catch (error) {
    console.error('Erro ao carregar posts:', error);
    return [];
  }
};

// Carrega uma página do feed público. Retorna { posts, hasMore, ok }.
// Tenta o snapshot estático primeiro; cai no Supabase se ele não existir.
export const getPostsPage = async (opts = {}) => {
  const { page = 0, pageSize = 12 } = opts;

  const index = await loadStaticIndex();
  if (index) {
    const from = page * pageSize;
    const slice = index.slice(from, from + pageSize);
    return {
      posts: slice.map(mapPost),
      hasMore: index.length > from + pageSize,
      ok: true
    };
  }

  try {
    const { rows, hasMore } = await postsAPI.getPostsPage(opts);
    return { posts: rows.map(mapPost), hasMore, ok: true };
  } catch (error) {
    console.error('Erro ao carregar posts:', error);
    return { posts: [], hasMore: false, ok: false };
  }
};

// Busca textual server-side. Retorna { posts, hasMore, ok }.
export const searchPosts = async (term, opts) => {
  const q = (term || '').trim();
  if (!q) return { posts: [], hasMore: false, ok: true };
  try {
    // vírgulas e parênteses quebram a sintaxe de filtro do PostgREST
    const safe = q.replace(/[,()]/g, ' ');
    const { rows, hasMore } = await postsAPI.searchPosts(safe, opts);
    return { posts: rows.map(mapPost), hasMore, ok: true };
  } catch (error) {
    console.error('Erro na busca:', error);
    return { posts: [], hasMore: false, ok: false };
  }
};

// Nomes de categorias distintos, ordenados (pt-BR).
export const getCategoryNames = async () => {
  try {
    const names = await postsAPI.getCategoryNames();
    return names.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    return [];
  }
};

// Busca um post por slug (padrão) ou por id numérico.
export const getPostBySlugOrId = async (slugOrId) => {
  try {
    const asNumber = Number(slugOrId);
    const isNumericId =
      slugOrId !== '' && slugOrId !== null && !Number.isNaN(asNumber);

    if (isNumericId) {
      const post = await postsAPI.getPostById(asNumber);
      return post ? mapPost(post) : null;
    }

    if (typeof slugOrId === 'string' && slugOrId.trim() !== '') {
      const post = await postsAPI.getPostBySlug(slugOrId);
      return post ? mapPost(post) : null;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return null;
  }
};

// Leitura pública de uma matéria: tenta o snapshot estático (por slug) e cai
// no Supabase se não achar. Use SÓ no site público — o admin deve continuar
// chamando getPostBySlugOrId (dados sempre frescos, inclui rascunhos).
export const getPublicPostBySlug = async (slugOrId) => {
  const key = String(slugOrId ?? '').trim();
  if (!key) return null;

  if (!/^\d+$/.test(key)) {
    const staticPost = await fetchStaticPost(key);
    if (staticPost) return mapPost(staticPost);
  }

  return getPostBySlugOrId(slugOrId);
};

// Salva um post (sempre no Supabase).
export const savePost = async (postData, isNew = false) => {
  try {
    // `source` e as duas colunas de corpo saem do spread de propósito.
    const { id, source: _source, content, text_content, ...rest } = postData;

    // A tabela `posts` tem duas colunas de corpo: `content` (legada) e
    // `text_content`. Todos os leitores (mapPost, middleware, feed) usam
    // `content || text_content`, então gravamos as duas com o mesmo valor
    // para nunca servir o corpo defasado depois de uma edição.
    //
    // O corpo passa pela MESMA sanitização da leitura pública (T1.3): o que
    // é gravado é exatamente o que o público vai renderizar. Texto puro sem
    // tags passa intacto; HTML fora da allowlist é limpo aqui. A rede de
    // segurança é o `content_backup` gravado logo abaixo (T1.2).
    const body = sanitizeHtml(text_content ?? content ?? '');
    const supabaseData = { ...rest, content: body, text_content: body };

    // Atualiza sempre que não for criação e houver um id — numérico ou UUID.
    // (A tabela `posts` usa ids inteiros; o teste de UUID antigo caía sempre
    // no `else` e criava uma cópia a cada edição.)
    const hasId = id !== undefined && id !== null && String(id).trim() !== '';

    if (!isNew && hasId) {
      // Rede de segurança (T1.2): antes de sobrescrever, guarda o corpo atual
      // em `content_backup` na mesma linha. Best-effort — se falhar (ex.: a
      // coluna ainda não existe no banco), o salvamento segue sem o backup.
      try {
        const current = await postsAPI.getPostById(id);
        if (current) {
          await postsAPI.updatePost(id, {
            content_backup: current.content ?? current.text_content ?? ''
          });
        }
      } catch (backupError) {
        console.warn(
          'Backup do corpo anterior não gravado (seguindo sem ele):',
          backupError.message
        );
      }

      const updatedPost = await postsAPI.updatePost(id, {
        ...supabaseData,
        updated_at: new Date().toISOString()
      });
      if (!updatedPost) {
        throw new Error(
          `Nenhuma matéria foi atualizada (id ${id}). Verifique o id e as permissões.`
        );
      }
      return { ...updatedPost, source: 'supabase' };
    }

    const newPost = await postsAPI.createPost({
      ...supabaseData,
      created_at: new Date().toISOString()
    });
    return { ...newPost, source: 'supabase' };
  } catch (error) {
    console.error('Erro ao salvar post:', error);
    throw error;
  }
};

// Remove um post.
export const deletePost = async (id) => {
  try {
    return await postsAPI.deletePost(id);
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    throw error;
  }
};

// Filtra posts por categoria (filtro no servidor: array `categories` contém o valor).
export const getPostsByCategory = async (category) => {
  try {
    const rows = await postsAPI.getPostsByCategory(category);
    return (rows || []).map(mapPost);
  } catch (error) {
    console.error('Erro ao buscar posts por categoria:', error);
    return [];
  }
};

// Lista de nomes de autores da tabela `authors`.
export const getAllAuthors = async () => {
  try {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data.map((author) => author.name);
  } catch (error) {
    console.error('Erro ao buscar autores:', error);
    return [];
  }
};
