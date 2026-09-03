import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Variáveis de ambiente do Supabase ausentes. Defina VITE_SUPABASE_URL e ' +
      'VITE_SUPABASE_ANON_KEY no arquivo .env (veja env.example).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções para gerenciar postagens
export const postsAPI = {
  async getAllPosts() {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuração do Supabase incompleta')
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar posts:', error)
      throw error
    }
    return data
  },

  async getPostById(id) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuração do Supabase incompleta')
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // não encontrado
      console.error('Erro ao buscar post por ID:', error)
      throw error
    }
    return data
  },

  async getPostBySlug(slug) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuração do Supabase incompleta')
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // não encontrado
      console.error('Erro ao buscar post por slug:', error)
      throw error
    }
    return data
  },

  async createPost(postData) {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()

    if (error) {
      console.error('Erro ao criar post:', error)
      throw error
    }
    return data[0]
  },

  async updatePost(id, postData) {
    const { data, error } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Erro ao atualizar post:', error)
      throw error
    }
    return data[0]
  },

  async deletePost(id) {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) throw error
    return true
  },

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
