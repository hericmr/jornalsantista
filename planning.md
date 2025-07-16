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

# Plano de Implementação - Sistema de Edição para Administradores

## Visão Geral
Implementar um sistema de autenticação e edição de conteúdo que permita apenas aos administradores editar os textos das notícias existentes no Jornal Santista.

## 1. Sistema de Autenticação

### 1.1 Estrutura de Usuários
```json
{
  "users": [
    {
      "id": "hericmr",
      "username": "adminheric",
      "password": "midia alternativa",
      "role": "admin",
      "name": "Administrador Principal",
      "email": "admin@jornalsantista.com",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 1.2 Páginas de Autenticação
- **Login** (`/admin/login`)
  - Formulário de login com username/email e senha
  - Validação de credenciais
  - Redirecionamento para dashboard após login
  - Lembrar sessão (localStorage/sessionStorage)

- **Logout** (`/admin/logout`)
  - Limpar sessão
  - Redirecionar para home

### 1.3 Proteção de Rotas
- Middleware para verificar autenticação
- Redirecionamento automático para login se não autenticado
- Rotas protegidas: `/admin/*`

## 2. Dashboard de Administração

### 2.1 Layout Principal (`/admin`)
```
┌─────────────────────────────────────┐
│ Header: Logo + Nome Admin + Logout  │
├─────────────────────────────────────┤
│ Sidebar: Menu de Navegação          │
├─────────────────────────────────────┤
│ Main Content: Área de Trabalho      │
└─────────────────────────────────────┘
```

### 2.2 Menu de Navegação
- **Dashboard** - Visão geral
- **Notícias** - Lista e edição de notícias
- **Categorias** - Gerenciar categorias
- **Usuários** - Gerenciar administradores
- **Configurações** - Configurações do site

## 3. Gerenciamento de Notícias

### 3.1 Lista de Notícias (`/admin/noticias`)
```
┌─────────────────────────────────────────────────────────┐
│ Buscar: [________________] [Filtrar por categoria]      │
├─────────────────────────────────────────────────────────┤
│ Título                    │ Autor │ Data    │ Ações     │
├─────────────────────────────────────────────────────────┤
│ Movimentos de mulheres... │ Héric │ 07/03   │ [Editar]  │
│ 9 de Março: Uma manif...  │ Héric │ 10/03   │ [Editar]  │
│ Sobre o Jornal           │ Héric │ 18/01   │ [Editar]  │
└─────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Lista paginada de todas as notícias
- Busca por título, autor ou conteúdo
- Filtro por categoria
- Ordenação por data, título, autor
- Botão de edição para cada notícia

### 3.2 Editor de Notícias (`/admin/noticias/editar/:id`)
```
┌─────────────────────────────────────────────────────────┐
│ [Voltar] Editar Notícia                    [Salvar]    │
├─────────────────────────────────────────────────────────┤
│ Título: [_____________________________________________] │
│ Autor:  [________________]                              │
│ Categorias: [Política] [Santos] [X] [Adicionar]        │
├─────────────────────────────────────────────────────────┤
│ Conteúdo:                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Editor de texto rico]                              │ │
│ │                                                     │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Imagens:                                                │
│ [Imagem 1] [Imagem 2] [Imagem 3] [+ Adicionar]         │
└─────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Editor de texto rico (WYSIWYG)
- Upload de imagens
- Preview em tempo real
- Validação de campos obrigatórios
- Histórico de alterações

## 4. Estrutura de Dados Atualizada

### 4.1 Notícias com Controle de Versão
```json
{
  "id": "tag:blogger.com,1999:blog-2089541151780709239.post-63484586837792184",
  "title": "Movimentos de mulheres organizam manifestação em Santos",
  "author": "Héric Moura",
  "published": "2017-03-07T14:47:00.003Z",
  "updated": "2024-01-15T10:30:00.000Z",
  "categories": ["Política", "Santos"],
  "text_content": "Conteúdo da notícia...",
  "images": ["url1", "url2"],
  "version": 2,
  "history": [
    {
      "version": 1,
      "date": "2017-03-07T14:47:00.003Z",
      "editor": "original",
      "changes": "Criação inicial"
    },
    {
      "version": 2,
      "date": "2024-01-15T10:30:00.000Z",
      "editor": "admin",
      "changes": "Correção de texto e adição de informações"
    }
  ],
  "last_edited_by": "admin",
  "last_edited_at": "2024-01-15T10:30:00.000Z"
}
```

## 5. Componentes React

### 5.1 Estrutura de Pastas
```
src/
├── admin/
│   ├── components/
│   │   ├── AdminLayout.jsx
│   │   ├── AdminSidebar.jsx
│   │   ├── NewsList.jsx
│   │   ├── NewsEditor.jsx
│   │   └── ImageUploader.jsx
│   ├── pages/
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminNews.jsx
│   │   └── AdminNewsEdit.jsx
│   └── hooks/
│       ├── useAuth.js
│       └── useAdmin.js
├── auth/
│   ├── AuthContext.jsx
│   ├── AuthProvider.jsx
│   └── ProtectedRoute.jsx
└── utils/
    ├── auth.js
    └── api.js
```

### 5.2 Componentes Principais

#### AdminLayout.jsx
```jsx
const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminHeader />
      <div className="admin-container">
        <AdminSidebar />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};
```

#### NewsEditor.jsx
```jsx
const NewsEditor = ({ newsId }) => {
  const [news, setNews] = useState(null);
  const [content, setContent] = useState('');
  
  const handleSave = async () => {
    // Salvar alterações
    // Atualizar versão
    // Registrar no histórico
  };
  
  return (
    <div className="news-editor">
      <EditorToolbar />
      <RichTextEditor 
        value={content}
        onChange={setContent}
      />
      <ImageManager />
      <SaveButton onClick={handleSave} />
    </div>
  );
};
```

## 6. Autenticação e Segurança

### 6.1 Context de Autenticação
```jsx
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (credentials) => {
    // Validar credenciais
    // Armazenar token
    // Atualizar estado
  };
  
  const logout = () => {
    // Limpar token
    // Resetar estado
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 6.2 Rota Protegida
```jsx
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/admin/login" />;
  
  return children;
};
```

## 7. API e Backend

### 7.1 Endpoints Necessários
```
POST   /api/auth/login          - Login
POST   /api/auth/logout         - Logout
GET    /api/admin/news          - Listar notícias
GET    /api/admin/news/:id      - Buscar notícia
PUT    /api/admin/news/:id      - Atualizar notícia
POST   /api/admin/news/:id/history - Registrar alteração
```

### 7.2 Validação de Dados
```javascript
const validateNews = (data) => {
  const errors = {};
  
  if (!data.title?.trim()) {
    errors.title = 'Título é obrigatório';
  }
  
  if (!data.text_content?.trim()) {
    errors.text_content = 'Conteúdo é obrigatório';
  }
  
  if (!data.author?.trim()) {
    errors.author = 'Autor é obrigatório';
  }
  
  return errors;
};
```

## 8. Interface do Usuário

### 8.1 Design System
- **Cores**: Tema escuro para área administrativa
- **Tipografia**: Fonte monospace para editor
- **Componentes**: Botões, inputs, modais consistentes
- **Responsividade**: Funcional em desktop e tablet

### 8.2 Editor de Texto Rico
- **Funcionalidades**:
  - Formatação (negrito, itálico, sublinhado)
  - Títulos (H1, H2, H3)
  - Listas (ordenadas e não ordenadas)
  - Links
  - Imagens inline
  - Desfazer/Refazer

### 8.3 Gerenciamento de Imagens
- **Upload**: Drag & drop ou seleção de arquivo
- **Preview**: Visualização antes de salvar
- **Organização**: Reordenação por drag & drop
- **Exclusão**: Remoção individual de imagens

## 9. Funcionalidades Avançadas

### 9.1 Histórico de Alterações
- **Versionamento**: Cada alteração gera nova versão
- **Comparação**: Visualizar diferenças entre versões
- **Restauração**: Voltar para versão anterior
- **Logs**: Quem editou, quando, o que foi alterado

### 9.2 Backup e Segurança
- **Backup automático**: Salvar rascunhos periodicamente
- **Validação**: Verificar integridade dos dados
- **Logs de auditoria**: Registrar todas as ações
- **Recuperação**: Sistema de recuperação de dados

### 9.3 Performance
- **Lazy loading**: Carregar notícias sob demanda
- **Cache**: Armazenar dados frequentemente acessados
- **Otimização**: Compressão de imagens
- **CDN**: Distribuição de conteúdo

## 10. Cronograma de Implementação

### Fase 1 (Semana 1-2): Fundação
- [ ] Sistema de autenticação básico
- [ ] Layout administrativo
- [ ] Rotas protegidas
- [ ] Lista de notícias

### Fase 2 (Semana 3-4): Editor
- [ ] Editor de texto rico
- [ ] Upload de imagens
- [ ] Salvamento de alterações
- [ ] Validação de dados

### Fase 3 (Semana 5-6): Funcionalidades Avançadas
- [ ] Histórico de alterações
- [ ] Sistema de versões
- [ ] Backup automático
- [ ] Logs de auditoria

### Fase 4 (Semana 7-8): Polimento
- [ ] Testes e correções
- [ ] Otimização de performance
- [ ] Documentação
- [ ] Deploy em produção

## 11. Tecnologias Recomendadas

### Frontend
- **Editor**: React Quill ou Draft.js
- **Upload**: React Dropzone
- **Validação**: Yup ou Joi
- **Estado**: Context API ou Zustand

### Backend (se necessário)
- **API**: Express.js ou Next.js API routes
- **Autenticação**: JWT
- **Banco**: JSON file (atual) ou SQLite
- **Upload**: Multer

### Utilitários
- **Hash**: bcryptjs
- **Data**: date-fns
- **UI**: Bootstrap (já usado)
- **Ícones**: Bootstrap Icons

## 12. Considerações de Segurança

### 12.1 Autenticação
- Senhas hasheadas com bcrypt
- Tokens JWT com expiração
- Rate limiting para tentativas de login
- Logout automático por inatividade

### 12.2 Validação
- Sanitização de entrada HTML
- Validação de tipos de arquivo
- Limite de tamanho de upload
- Verificação de permissões

### 12.3 Auditoria
- Log de todas as ações administrativas
- Backup regular dos dados
- Monitoramento de atividades suspeitas
- Sistema de recuperação

## 13. Testes

### 13.1 Testes Unitários
- Componentes React
- Funções de validação
- Utilitários de autenticação

### 13.2 Testes de Integração
- Fluxo de login/logout
- CRUD de notícias
- Upload de imagens

### 13.3 Testes de Usabilidade
- Interface intuitiva
- Responsividade
- Acessibilidade

## 14. Documentação

### 14.1 Manual do Administrador
- Como fazer login
- Como editar notícias
- Como gerenciar imagens
- Como usar o histórico

### 14.2 Documentação Técnica
- Arquitetura do sistema
- API endpoints
- Estrutura de dados
- Configurações

## 15. Manutenção

### 15.1 Monitoramento
- Logs de erro
- Performance do sistema
- Uso de recursos
- Atividades dos usuários

### 15.2 Atualizações
- Atualizações de segurança
- Melhorias de funcionalidade
- Correções de bugs
- Otimizações de performance

---

**Este plano fornece uma base sólida para implementar um sistema de edição administrativa completo, mantendo a segurança e usabilidade como prioridades.** 