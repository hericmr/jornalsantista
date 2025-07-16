import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase - você precisará substituir essas variáveis
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções para gerenciar postagens
export const postsAPI = {
  // Buscar todas as postagens
  async getAllPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Buscar uma postagem por ID
  async getPostById(id) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Criar nova postagem
  async createPost(postData) {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Atualizar postagem
  async updatePost(id, postData) {
    const { data, error } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select()
    
    if (error) throw error
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