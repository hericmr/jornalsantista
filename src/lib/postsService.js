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
    console.log('🔍 Tentando carregar posts do Supabase...');
    const posts = await postsAPI.getAllPosts();
    console.log('📊 Posts do Supabase recebidos:', posts);
    return posts.map(post => {
      // Mapear campos do Supabase para o formato esperado pelo frontend
      const mappedPost = {
        ...post,
        source: 'supabase', // Marcar como origem do Supabase
        // Mapear content do Supabase para text_content (campo esperado pelo frontend)
        text_content: post.content || post.text_content || '',
        // Mapear published_at para published se necessário
        published: post.published || post.published_at,
        // Garantir que outros campos existam
        title: post.title || 'Título não disponível',
        author: post.author || 'Autor não informado',
        categories: post.categories || [],
        images: post.images || []
      };
      
      console.log('🔄 Post mapeado:', {
        id: mappedPost.id,
        title: mappedPost.title,
        hasTextContent: !!mappedPost.text_content,
        textContentLength: mappedPost.text_content?.length || 0,
        source: mappedPost.source
      });
      
      return mappedPost;
    });
  } catch (error) {
    console.error('❌ Erro ao carregar posts do Supabase:', error);
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
    
    // Verificar se os posts do Supabase têm text_content
    supabasePosts.forEach((post, index) => {
      console.log(`📝 Post ${index + 1} do Supabase:`, {
        id: post.id,
        title: post.title,
        hasTextContent: !!post.text_content,
        textContentLength: post.text_content?.length || 0,
        hasContent: !!post.content,
        contentLength: post.content?.length || 0
      });
    });
    
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
    
    // Verificar posts finais
    const finalSupabasePosts = sortedPosts.filter(post => post.source === 'supabase');
    console.log(`🗄️ Posts finais do Supabase: ${finalSupabasePosts.length}`);
    
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
    console.log('🔍 Buscando post por ID:', id);
    
    // Se o ID começa com 'local-', buscar apenas no JSON local
    if (id.startsWith('local-')) {
      console.log('📄 Buscando post local...');
      const localPosts = await loadLocalPosts();
      const foundPost = localPosts.find(post => post.id === id);
      console.log('📄 Post local encontrado:', !!foundPost);
      return foundPost;
    }
    
    // Caso contrário, tentar no Supabase primeiro
    try {
      console.log('🗄️ Tentando buscar no Supabase...');
      const supabasePost = await postsAPI.getPostById(id);
      if (supabasePost) {
        console.log('🔍 Post encontrado no Supabase:', supabasePost);
        
        // Mapear campos do Supabase para o formato esperado pelo frontend
        const mappedPost = {
          ...supabasePost,
          source: 'supabase',
          // Mapear content do Supabase para text_content (campo esperado pelo frontend)
          text_content: supabasePost.content || supabasePost.text_content || '',
          // Mapear published_at para published se necessário
          published: supabasePost.published || supabasePost.published_at,
          // Garantir que outros campos existam
          title: supabasePost.title || 'Título não disponível',
          author: supabasePost.author || 'Autor não informado',
          categories: supabasePost.categories || [],
          images: supabasePost.images || []
        };
        
        console.log('🔄 Post mapeado para frontend:', {
          id: mappedPost.id,
          title: mappedPost.title,
          hasTextContent: !!mappedPost.text_content,
          textContentLength: mappedPost.text_content?.length || 0,
          source: mappedPost.source
        });
        
        return mappedPost;
      } else {
        console.log('❌ Post não encontrado no Supabase');
      }
    } catch (error) {
      console.log('❌ Erro ao buscar no Supabase:', error.message);
    }
    
    // Se não encontrou no Supabase, buscar no JSON local
    console.log('📄 Tentando buscar no JSON local...');
    const localPosts = await loadLocalPosts();
    const foundPost = localPosts.find(post => post.id === id);
    console.log('📄 Post local encontrado:', !!foundPost);
    return foundPost;
    
  } catch (error) {
    console.error('Erro ao buscar post por ID:', error);
    return null;
  }
};

// Função para salvar post (sempre no Supabase)
export const savePost = async (postData, isNew = false) => {
  try {
    // Remover campos que não devem ser enviados para o Supabase
    const { id, source, ...cleanPostData } = postData;
    
    // Mapear text_content para content (campo esperado pelo Supabase)
    const supabaseData = {
      ...cleanPostData,
      content: cleanPostData.text_content || cleanPostData.content || '',
      // Remover text_content para evitar duplicação
      text_content: undefined
    };
    
    console.log('📝 Dados para salvar no Supabase:', {
      title: supabaseData.title,
      hasContent: !!supabaseData.content,
      contentLength: supabaseData.content?.length || 0,
      contentPreview: supabaseData.content?.substring(0, 100) + '...'
    });
    
    if (isNew) {
      // Deixar o Supabase gerar ID sequencial automaticamente
      console.log(`📝 Criando nova postagem no Supabase (ID será gerado automaticamente)`);
      
      const newPost = await postsAPI.createPost({
        ...supabaseData,
        created_at: new Date().toISOString()
      });
      return { ...newPost, source: 'supabase' };
    } else {
      // Verificar se o ID é um UUID válido (formato do Supabase)
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (isValidUUID.test(id)) {
        // ID é um UUID válido, tentar atualizar
        console.log('🔄 Atualizando post existente no Supabase com ID:', id);
        const updatedPost = await postsAPI.updatePost(id, {
          ...supabaseData,
          updated_at: new Date().toISOString()
        });
        return { ...updatedPost, source: 'supabase' };
      } else {
        // ID não é um UUID válido, criar como nova postagem
        console.log('🆕 ID inválido, criando nova postagem no Supabase (ID será gerado automaticamente)');
        
        const newPost = await postsAPI.createPost({
          ...supabaseData,
          created_at: new Date().toISOString()
        });
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
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (isValidUUID.test(id)) {
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