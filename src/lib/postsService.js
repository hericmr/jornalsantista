import { postsAPI } from './supabase';
import { supabase } from './supabase';
import { slugify } from '../utils/textUtils';
import { resolvePostImages } from './images';

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
export const getPostsPage = async (opts) => {
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

// Salva um post (sempre no Supabase).
export const savePost = async (postData, isNew = false) => {
  try {
    const { id, source, ...cleanPostData } = postData;

    const supabaseData = {
      ...cleanPostData,
      text_content: cleanPostData.text_content || cleanPostData.content || ''
    };
    if (supabaseData.text_content && supabaseData.content) {
      delete supabaseData.content;
    }

    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!isNew && isValidUUID.test(id)) {
      const updatedPost = await postsAPI.updatePost(id, {
        ...supabaseData,
        updated_at: new Date().toISOString()
      });
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

// Perfis (avatar / link) dos autores informados, da tabela `authors`.
// Retorna um mapa { [name]: { name, avatar_url, profile_url } }.
export const getAuthorProfiles = async (names = []) => {
  const clean = [...new Set(names.filter((n) => n && typeof n === 'string'))];
  if (clean.length === 0) return {};
  try {
    const { data, error } = await supabase
      .from('authors')
      .select('name, avatar_url, profile_url')
      .in('name', clean);
    if (error) throw error;
    const map = {};
    (data || []).forEach((a) => {
      map[a.name] = a;
    });
    return map;
  } catch (error) {
    console.error('Erro ao carregar perfis de autores:', error);
    return {};
  }
};

// Matérias relacionadas: mesma editoria primeiro, completadas com as mais
// recentes. Exclui a matéria atual.
export const getRelatedPosts = async ({ category, excludeSlug, limit = 3 } = {}) => {
  try {
    let rows = [];
    if (category) {
      rows = await postsAPI.getPostsByCategory(category).catch(() => []);
    }
    if (!Array.isArray(rows)) rows = [];

    if (rows.length < limit + 1) {
      const page = await postsAPI.getPostsPage({ page: 0, pageSize: limit + 6 });
      rows = rows.concat(page.rows || []);
    }

    const seen = new Set();
    return rows
      .map(mapPost)
      .filter((p) => {
        if (!p.slug || p.slug === excludeSlug || seen.has(p.slug)) return false;
        seen.add(p.slug);
        return true;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Erro ao carregar matérias relacionadas:', error);
    return [];
  }
};
