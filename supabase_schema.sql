-- Criação da tabela de postagens para o Jornal Santista
-- Execute este SQL no SQL Editor do Supabase

-- Habilitar a extensão uuid-ossp para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar a tabela de postagens
CREATE TABLE posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author VARCHAR(100),
    categories TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_categories ON posts USING GIN(categories);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- Criar função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo (opcional)
INSERT INTO posts (title, excerpt, content, author, categories, tags, status, published_at) VALUES
(
    'Primeira Notícia do Jornal Santista',
    'Esta é a primeira notícia publicada no nosso jornal digital.',
    '<p>Bem-vindos ao <strong>Jornal Santista</strong>! Este é o nosso primeiro artigo publicado.</p><p>Estamos muito felizes em apresentar nossa nova plataforma de notícias para a região de Santos.</p>',
    'Redação',
    ARRAY['Geral', 'Local'],
    ARRAY['inauguração', 'jornal'],
    'published',
    NOW()
);

-- Configurar Row Level Security (RLS) - opcional para controle de acesso
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública de posts publicados
-- CREATE POLICY "Posts públicos são visíveis para todos" ON posts
--     FOR SELECT USING (status = 'published');

-- Política para permitir que usuários autenticados criem posts
-- CREATE POLICY "Usuários autenticados podem criar posts" ON posts
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir que usuários autenticados atualizem posts
-- CREATE POLICY "Usuários autenticados podem atualizar posts" ON posts
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir que usuários autenticados deletem posts
-- CREATE POLICY "Usuários autenticados podem deletar posts" ON posts
--     FOR DELETE USING (auth.role() = 'authenticated'); 