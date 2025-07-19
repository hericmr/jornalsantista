import { postsAPI } from './supabase';
import { slugify } from '../utils/textUtils';

// Função para carregar posts do Supabase
const loadSupabasePosts = async () => {
  try {
    console.log('🔍 Tentando carregar posts do Supabase...');
    const posts = await postsAPI.getAllPosts();
    console.log('📊 Posts do Supabase recebidos:', posts);
    return posts.map(post => {
      // Mapear campos do Supabase para o formato esperado pelo frontend
      const mappedPost = {
        ...post,
        source: 'supabase',
        text_content: post.content || post.text_content || '',
        published: post.published || post.published_at,
        title: post.title || 'Título não disponível',
        author: post.author || 'Autor não informado',
        categories: post.categories || [],
        images: post.images ? (typeof post.images === 'string' ? JSON.parse(post.images) : post.images) : [],
        slug: post.slug || slugify(post.title || post.id || '')
      };
      return mappedPost;
    });
  } catch (error) {
    console.error('❌ Erro ao carregar posts do Supabase:', error);
    return [];
  }
};

// Função principal para carregar todos os posts (apenas Supabase)
export const getAllPosts = async () => {
  try {
    console.log('🔄 Carregando posts do Supabase...');
    const supabasePosts = await loadSupabasePosts();
    console.log(`🗄️ Posts do Supabase carregados: ${supabasePosts.length}`);
    // Ordenar por data de publicação (mais recentes primeiro)
    const sortedPosts = supabasePosts.sort((a, b) => {
      const dateA = new Date(a.published || a.published_at || 0);
      const dateB = new Date(b.published || b.published_at || 0);
      return dateB - dateA;
    });
    return sortedPosts;
  } catch (error) {
    console.error('Erro ao carregar posts:', error);
    return [];
  }
};

// Função para buscar post por slug ou id (apenas Supabase)
export const getPostById = async (slugOrId) => {
  try {
    console.log('🔍 Buscando post por slug ou ID:', slugOrId);
    // 1. Buscar no Supabase pelo slug
    try {
      const supabasePost = await postsAPI.getPostBySlug(slugOrId);
      if (supabasePost) {
        return {
          ...supabasePost,
          source: 'supabase',
          text_content: supabasePost.content || supabasePost.text_content || '',
          published: supabasePost.published || supabasePost.published_at,
          title: supabasePost.title || 'Título não disponível',
          author: supabasePost.author || 'Autor não informado',
          categories: supabasePost.categories || [],
          images: supabasePost.images || [],
          slug: supabasePost.slug || slugify(supabasePost.title || supabasePost.id || '')
        };
      }
    } catch (e) { /* ignora erro */ }
    // 2. Buscar no Supabase pelo id (retrocompatibilidade)
    try {
      const supabasePost = await postsAPI.getPostById(slugOrId);
      if (supabasePost) {
        return {
          ...supabasePost,
          source: 'supabase',
          text_content: supabasePost.content || supabasePost.text_content || '',
          published: supabasePost.published || supabasePost.published_at,
          title: supabasePost.title || 'Título não disponível',
          author: supabasePost.author || 'Autor não informado',
          categories: supabasePost.categories || [],
          images: supabasePost.images || [],
          slug: supabasePost.slug || slugify(supabasePost.title || supabasePost.id || '')
        };
      }
    } catch (e) { /* ignora erro */ }
    return null;
  } catch (error) {
    console.error('Erro ao buscar post por slug ou ID:', error);
    return null;
  }
};

// Função para salvar post (sempre no Supabase)
export const savePost = async (postData, isNew = false) => {
  try {
    console.log('📝 savePost - Dados recebidos:', postData);
    console.log('📝 savePost - isNew:', isNew);
    
    // Remover campos que não devem ser enviados para o Supabase
    const { id, source, ...cleanPostData } = postData;
    
    // Preparar dados para o Supabase (sem text_content duplicado)
    const supabaseData = {
      ...cleanPostData,
      // Mapear text_content para content se necessário
      text_content: cleanPostData.text_content || cleanPostData.content || ''
    };
    
    // Remover campo content se text_content está sendo usado
    if (supabaseData.text_content && supabaseData.content) {
      delete supabaseData.content;
    }
    
    console.log('📝 savePost - Dados para Supabase:', supabaseData);
    if (isNew) {
      console.log('📝 savePost - Criando novo post...');
      const newPost = await postsAPI.createPost({
        ...supabaseData,
        created_at: new Date().toISOString()
      });
      console.log('✅ savePost - Post criado com sucesso:', newPost);
      return { ...newPost, source: 'supabase' };
    } else {
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (isValidUUID.test(id)) {
        console.log('📝 savePost - Atualizando post existente:', id);
        const updatedPost = await postsAPI.updatePost(id, {
          ...supabaseData,
          updated_at: new Date().toISOString()
        });
        console.log('✅ savePost - Post atualizado com sucesso:', updatedPost);
        return { ...updatedPost, source: 'supabase' };
      } else {
        console.log('📝 savePost - ID inválido, criando novo post...');
        const newPost = await postsAPI.createPost({
          ...supabaseData,
          created_at: new Date().toISOString()
        });
        console.log('✅ savePost - Post criado com sucesso:', newPost);
        return { ...newPost, source: 'supabase' };
      }
    }
  } catch (error) {
    console.error('Erro ao salvar post:', error);
    throw error;
  }
};

// Função para deletar post (apenas do Supabase)
export const deletePost = async (id) => {
  try {
    // Só deletar se for um post do Supabase (UUID válido)
    return await postsAPI.deletePost(id);
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    throw error;
  }
};

// Função para buscar posts por categoria
export const getPostsByCategory = async (category) => {
  try {
    const allPosts = await getAllPosts();
    return allPosts.filter(post => {
      const categories = post.categories || [post.category].filter(Boolean);
      return categories.some(cat => 
        cat.toLowerCase().includes(category.toLowerCase())
      );
    });
  } catch (error) {
    console.error('Erro ao buscar posts por categoria:', error);
    return [];
  }
}; 