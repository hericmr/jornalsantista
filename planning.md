# Planejamento do Projeto: Jornal Santista

## Visão Geral
O Jornal Santista será um site de notícias focado em informações relevantes para a região da Baixada Santista. O objetivo é oferecer notícias atualizadas, confiáveis e de fácil acesso para a população local.

## Identidade Visual
- Cores principais: **preto** e **branco**
- Visual limpo, moderno e de fácil leitura

## Estrutura dos Dados (blog_posts.json)
Cada postagem possui:
- `id`: identificador único da postagem
- `title`: título da matéria
- `author`: autor(a)
- `published`: data/hora de publicação
- `updated`: data/hora da última atualização
- `categories`: lista de categorias/temas (pode estar vazia)
- `text_content`: corpo do texto da matéria
- `images`: lista de URLs de imagens relacionadas

## Como o site deve funcionar
### Página Inicial
- Exibir lista das postagens mais recentes, com título, resumo, autor, data e imagem de destaque (primeira da lista de `images`).
- Destaque para matéria em evidência (mais recente ou lógica futura).

### Página de Notícia Individual
- Exibir título, autor, data de publicação, imagens (em galeria ou destaque), texto completo e categorias.
- Exibir data de atualização, se diferente da publicação.

### Categorias
- Listar todas as categorias encontradas no JSON.
- Permitir navegação por categoria, exibindo as matérias relacionadas.

### Busca
- Permitir busca por palavra-chave no título e no texto das matérias.

### Sobre
- Página institucional, pode usar o conteúdo da postagem “Sobre o Jornal”.

### Contato
- Página simples com informações de contato/redes sociais.

## Tecnologias Sugeridas
- Frontend: **React** + **Bootstrap** (HTML, CSS, JavaScript)
- Backend e Banco de Dados: **Supabase** (futuro)
- **Por enquanto, as postagens serão lidas do arquivo `blog_posts.json`. Posteriormente, as matérias serão migradas para o Supabase.**

## Detalhes Técnicos
- O frontend React deve ler o arquivo `blog_posts.json` (import local ou endpoint estático).
- Datas devem ser formatadas para exibição amigável.
- Se `categories` estiver vazia, exibir “Sem categoria”.
- Exibir a primeira imagem como destaque na listagem e no topo da matéria; demais imagens como galeria ou miniaturas.
- Garantir acessibilidade e responsividade.

## Futuras Integrações
- O modelo de dados do Supabase deve seguir a estrutura do JSON para facilitar a migração.
- O painel administrativo futuro permitirá criar/editar/excluir postagens, autores e categorias.

## Próximos Passos
1. Definir identidade visual (logo, cores preto e branco, tipografia)
2. Criar protótipo das páginas principais (wireframes)
3. Desenvolver o frontend estático com React e Bootstrap
4. Planejar a estrutura das tabelas e autenticação no Supabase
5. Implementar integração com Supabase para cadastro e exibição dinâmica das notícias
6. Adicionar painel administrativo para publicação e edição de notícias (futuro)

## Observações
- O projeto será desenvolvido inicialmente de forma estática, facilitando a futura integração com Supabase.
- O foco inicial é a experiência do usuário e a organização do conteúdo.
- **Durante o desenvolvimento inicial, as notícias serão carregadas do arquivo `blog_posts.json`.**

---

## Checklist para Execução do Site

repositorio criado em Quick setup — if you’ve done this kind of thing before

Get started by creating a new file or uploading an existing file. We recommend every repository include a README, LICENSE, and .gitignore.
…or create a new repository on the command line

echo "# js" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/hericmr/js.git
git push -u origin main

…or push an existing repository from the command line

git remote add origin https://github.com/hericmr/js.git
git branch -M main
git push -u origin main

### Configuração Inicial
- [ ] Criar repositório do projeto
- [ ] Inicializar projeto React com Vite ou Create React App
- [ ] Instalar Bootstrap e configurar no projeto
- [ ] Adicionar arquivo `blog_posts.json` ao projeto (pasta `public` ou `src/data`)

### Estrutura de Pastas e Componentes
- [ ] Definir estrutura de pastas (ex: `components`, `pages`, `data`, `assets`)
- [ ] Criar componentes principais: Header, Footer, PostList, PostItem, PostDetail, CategoryList, SearchBar
- [ ] Criar páginas: Home, Notícia, Categorias, Sobre, Contato

### Funcionalidades Básicas
- [ ] Ler e exibir postagens do `blog_posts.json`
- [ ] Exibir lista de notícias na Home (com imagem, título, resumo, autor, data)
- [ ] Implementar página de notícia individual
- [ ] Implementar listagem e navegação por categorias
- [ ] Implementar busca por palavra-chave
- [ ] Página Sobre (usando conteúdo do JSON)
- [ ] Página Contato (informações básicas)

### Detalhes Visuais e Técnicos
- [ ] Aplicar identidade visual (preto e branco, visual limpo)
- [ ] Garantir responsividade e acessibilidade
- [ ] Formatar datas para exibição amigável
- [ ] Exibir imagens corretamente (destaque e galeria)
- [ ] Tratar casos de ausência de categoria ou imagem

### Futuras Integrações
- [ ] Planejar estrutura de tabelas no Supabase baseada no JSON
- [ ] Preparar funções para futura integração com Supabase
- [ ] Planejar painel administrativo (futuro)

---

*Este documento será atualizado conforme o projeto evoluir.* 