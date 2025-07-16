import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase - você precisará substituir essas variáveis
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções para gerenciar postagens
export const postsAPI = {
  // Buscar todas as postagens
  async getAllPosts() {
    console.log('🔍 Supabase: Tentando buscar todas as postagens...');
    console.log('🔗 URL:', supabaseUrl);
    console.log('🔑 Anon Key:', supabaseAnonKey ? 'Presente' : 'Ausente');
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro no Supabase:', error);
      throw error;
    }
    
    console.log('✅ Supabase: Posts carregados com sucesso:', data?.length || 0);
    
    // Verificar estrutura dos dados
    if (data && data.length > 0) {
      console.log('📊 Estrutura do primeiro post:', {
        id: data[0].id,
        title: data[0].title,
        hasContent: !!data[0].content,
        contentLength: data[0].content?.length || 0,
        hasTextContent: !!data[0].text_content,
        textContentLength: data[0].text_content?.length || 0
      });
    }
    
    return data
  },

  // Buscar uma postagem por ID
  async getPostById(id) {
    console.log('🔍 Supabase: Buscando post por ID:', id);
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('❌ Erro ao buscar post por ID:', error);
      throw error;
    }
    
    console.log('✅ Supabase: Post encontrado:', {
      id: data?.id,
      title: data?.title,
      hasContent: !!data?.content,
      contentLength: data?.content?.length || 0,
      hasTextContent: !!data?.text_content,
      textContentLength: data?.text_content?.length || 0
    });
    
    return data
  },

  // Criar nova postagem
  async createPost(postData) {
    console.log('📝 Supabase: Criando nova postagem:', {
      title: postData.title,
      hasContent: !!postData.content,
      contentLength: postData.content?.length || 0
    });
    
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
    
    if (error) {
      console.error('❌ Erro ao criar post:', error);
      throw error;
    }
    
    console.log('✅ Supabase: Post criado com sucesso:', data[0]?.id);
    return data[0]
  },

  // Atualizar postagem
  async updatePost(id, postData) {
    console.log('📝 Supabase: Atualizando postagem:', {
      id: id,
      title: postData.title,
      hasContent: !!postData.content,
      contentLength: postData.content?.length || 0
    });
    
    const { data, error } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('❌ Erro ao atualizar post:', error);
      throw error;
    }
    
    console.log('✅ Supabase: Post atualizado com sucesso:', data[0]?.id);
    return data[0]
  },

  // Deletar postagem
  async deletePost(id) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Buscar postagens por categoria
  async getPostsByCategory(category) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .contains('categories', [category])
      .order('published_at', { ascending: false })
    
    if (error) throw error
    return data
  }
} 