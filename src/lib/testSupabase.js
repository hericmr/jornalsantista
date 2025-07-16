import { supabase } from './supabase.js'

// Função para testar a conexão com o Supabase
export const testSupabaseConnection = async () => {
  try {
    console.log('🔄 Testando conexão com Supabase...')
    
    // Testar conexão básica
    const { data, error } = await supabase
      .from('posts')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão:', error)
      return false
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!')
    console.log('📊 Dados recebidos:', data)
    return true
    
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error)
    return false
  }
}

// Função para verificar se a tabela posts existe
export const checkPostsTable = async () => {
  try {
    console.log('🔍 Verificando tabela posts...')
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Erro ao acessar tabela posts:', error)
      return false
    }
    
    console.log('✅ Tabela posts encontrada!')
    console.log('📝 Posts encontrados:', data.length)
    return true
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error)
    return false
  }
} 