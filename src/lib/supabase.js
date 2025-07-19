import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase - você precisará substituir essas variáveis
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não configuradas!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Presente' : 'AUSENTE');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Presente' : 'AUSENTE');
  console.error('📋 Para corrigir:');
  console.error('1. Crie/edite o arquivo .env na raiz do projeto');
  console.error('2. Adicione as variáveis:');
  console.error('   VITE_SUPABASE_URL=sua_url_do_supabase');
  console.error('   VITE_SUPABASE_ANON_KEY=sua_chave_anonima');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Testar conectividade na inicialização
supabase.from('posts').select('count', { count: 'exact' }).then(({ count, error }) => {
  if (error) {
    console.error('❌ Erro de conectividade com Supabase:', error.message);
  } else {
    console.log('✅ Supabase conectado com sucesso. Posts disponíveis:', count);
  }
}).catch(err => {
  console.error('❌ Falha ao testar conectividade:', err.message);
});

// Funções para gerenciar postagens
export const postsAPI = {
  // Buscar todas as postagens
  async getAllPosts() {
    console.log('🔍 Supabase: Tentando buscar todas as postagens...');
    console.log('🔗 URL:', supabaseUrl);
    console.log('🔑 Anon Key:', supabaseAnonKey ? 'Presente' : 'Ausente');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Variáveis de ambiente do Supabase não configuradas');
      throw new Error('Configuração do Supabase incompleta');
    }
    
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
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuração do Supabase incompleta');
    }
    
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

  // Buscar uma postagem por slug
  async getPostBySlug(slug) {
    console.log('🔍 Supabase: Buscando post por slug:', slug);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuração do Supabase incompleta');
    }
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // Not found
        console.log('ℹ️ Post não encontrado por slug:', slug);
        return null;
      }
      console.error('❌ Erro ao buscar post por slug:', error);
      throw error;
    }
    
    console.log('✅ Supabase: Post encontrado por slug:', {
      id: data?.id,
      title: data?.title,
      slug: data?.slug,
      hasContent: !!data?.content,
      contentLength: data?.content?.length || 0,
      hasTextContent: !!data?.text_content,
      textContentLength: data?.text_content?.length || 0
    });
    
    return data;
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