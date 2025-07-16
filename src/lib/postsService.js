import { postsAPI } from './supabase';

// Função para carregar posts do JSON local
const loadLocalPosts = async () => {
  try {
    const response = await fetch('/blog_posts.json');
    const data = await response.json();
    // Aceita tanto {posts: [...]} quanto um array direto
    const posts = Array.isArray(data) ? data : data.posts || [];
    return posts.map(post => ({
      ...post,
      source: 'local', // Marcar como origem local
      id: post.id || `local-${Date.now()}-${Math.random()}`
    }));
  } catch (error) {
    console.error('Erro ao carregar posts locais:', error);
    return [];
  }
};

// Função para carregar posts do Supabase
const loadSupabasePosts = async () => {
  try {
    const posts = await postsAPI.getAllPosts();
    return posts.map(post => ({
      ...post,
      source: 'supabase' // Marcar como origem do Supabase
    }));
  } catch (error) {
    console.error('Erro ao carregar posts do Supabase:', error);
    return [];
  }
};

// Função principal para carregar todos os posts (híbrida)
export const getAllPosts = async () => {
  try {
    console.log('🔄 Carregando posts (sistema híbrido)...');
    
    // Carregar posts locais primeiro
    const localPosts = await loadLocalPosts();
    console.log(`📄 Posts locais carregados: ${localPosts.length}`);
    
    // Carregar posts do Supabase
    const supabasePosts = await loadSupabasePosts();
    console.log(`🗄️ Posts do Supabase carregados: ${supabasePosts.length}`);
    
    // Combinar posts, dando prioridade aos do Supabase (mais recentes)
    const allPosts = [...localPosts, ...supabasePosts];
    
    // Remover duplicatas baseado no título (posts do Supabase têm prioridade)
    const uniquePosts = allPosts.reduce((acc, post) => {
      const existingIndex = acc.findIndex(p => p.title === post.title);
      if (existingIndex === -1) {
        acc.push(post);
      } else if (post.source === 'supabase') {
        // Substituir post local pelo do Supabase
        acc[existingIndex] = post;
      }
      return acc;
    }, []);
    
    // Ordenar por data de publicação (mais recentes primeiro)
    const sortedPosts = uniquePosts.sort((a, b) => {
      const dateA = new Date(a.published || a.published_at || 0);
      const dateB = new Date(b.published || b.published_at || 0);
      return dateB - dateA;
    });
    
    console.log(`✅ Total de posts únicos: ${sortedPosts.length}`);
    return sortedPosts;
    
  } catch (error) {
    console.error('Erro ao carregar posts:', error);
    // Em caso de erro, tentar apenas posts locais
    return await loadLocalPosts();
  }
};

// Função para buscar post por ID
export const getPostById = async (id) => {
  try {
    // Se o ID começa com 'local-', buscar apenas no JSON local
    if (id.startsWith('local-')) {
      const localPosts = await loadLocalPosts();
      return localPosts.find(post => post.id === id);
    }
    
    // Caso contrário, tentar no Supabase primeiro
    try {
      const supabasePost = await postsAPI.getPostById(id);
      if (supabasePost) {
        return { ...supabasePost, source: 'supabase' };
      }
    } catch (error) {
      console.log('Post não encontrado no Supabase, tentando local...');
    }
    
    // Se não encontrou no Supabase, buscar no JSON local
    const localPosts = await loadLocalPosts();
    return localPosts.find(post => post.id === id);
    
  } catch (error) {
    console.error('Erro ao buscar post por ID:', error);
    return null;
  }
};

// Função para salvar post (sempre no Supabase)
export const savePost = async (postData, isNew = false) => {
  try {
    if (isNew) {
      const newPost = await postsAPI.createPost({
        ...postData,
        created_at: new Date().toISOString()
      });
      return { ...newPost, source: 'supabase' };
    } else {
      const updatedPost = await postsAPI.updatePost(postData.id, {
        ...postData,
        updated_at: new Date().toISOString()
      });
      return { ...updatedPost, source: 'supabase' };
    }
  } catch (error) {
    console.error('Erro ao salvar post:', error);
    throw error;
  }
};

// Função para deletar post (apenas do Supabase)
export const deletePost = async (id) => {
  try {
    // Só deletar se for um post do Supabase
    if (!id.startsWith('local-')) {
      await postsAPI.deletePost(id);
      return true;
    } else {
      console.log('Posts locais não podem ser deletados via interface');
      return false;
    }
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