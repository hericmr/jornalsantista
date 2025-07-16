import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaImage, FaLink, FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaQuoteLeft } from 'react-icons/fa';
import { postsAPI } from '../../lib/supabase';

const AdminEditarNoticia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    categories: [],
    author: '',
    published: '',
    images: [],
    tags: [],
    status: 'draft'
  });

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      const foundPost = await postsAPI.getPostById(id);
      
      console.log('Post encontrado:', foundPost); // Debug
      
      if (foundPost) {
        const postData = {
          title: foundPost.title || '',
          excerpt: foundPost.excerpt || '',
          content: foundPost.content || '',
          categories: foundPost.categories || [],
          author: foundPost.author || '',
          published: foundPost.published_at ? new Date(foundPost.published_at).toISOString().split('T')[0] : '',
          images: foundPost.images || [],
          tags: foundPost.tags || [],
          status: foundPost.status || 'draft'
        };
        
        console.log('Dados mapeados:', postData); // Debug
        setPost(postData);
      } else {
        alert('Notícia não encontrada');
        navigate('/admin/noticias');
      }
    } catch (error) {
      console.error('Erro ao carregar post:', error);
      alert('Erro ao carregar a notícia');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    
    setPost(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index) => {
    setPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const postData = {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        categories: post.categories,
        author: post.author,
        published_at: post.published ? new Date(post.published).toISOString() : null,
        images: post.images,
        tags: post.tags,
        status: post.status,
        updated_at: new Date().toISOString()
      };

      if (id) {
        // Atualizar postagem existente
        await postsAPI.updatePost(id, postData);
        alert('Notícia atualizada com sucesso!');
      } else {
        // Criar nova postagem
        await postsAPI.createPost({
          ...postData,
          created_at: new Date().toISOString()
        });
        alert('Notícia criada com sucesso!');
      }
      
      navigate('/admin/noticias');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar a notícia: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Funções para formatação de texto
  const formatText = (command, value = null) => {
    const textarea = document.getElementById('content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = post.content.substring(start, end);
    let newText = '';

    switch (command) {
      case 'bold':
        newText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        newText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        newText = `<u>${selectedText}</u>`;
        break;
      case 'ul':
        newText = `<ul><li>${selectedText}</li></ul>`;
        break;
      case 'ol':
        newText = `<ol><li>${selectedText}</li></ol>`;
        break;
      case 'quote':
        newText = `<blockquote>${selectedText}</blockquote>`;
        break;
      default:
        return;
    }

    const newContent = post.content.substring(0, start) + newText + post.content.substring(end);
    setPost(prev => ({ ...prev, content: newContent }));
    
    // Restaurar foco
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + newText.length);
    }, 0);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-editar-noticia">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Editar Notícia</h2>
        <div>
          <button 
            onClick={() => navigate('/admin/noticias')}
            className="btn btn-outline-secondary me-2"
          >
            <FaTimes className="me-2" />
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="btn btn-primary"
          >
            <FaSave className="me-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Conteúdo da Notícia</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Título *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={post.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="excerpt" className="form-label">Resumo</label>
                  <textarea
                    className="form-control"
                    id="excerpt"
                    name="excerpt"
                    rows="3"
                    value={post.excerpt}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="categories" className="form-label">Categorias</label>
                      <input
                        type="text"
                        className="form-control"
                        id="categories"
                        name="categories"
                        value={Array.isArray(post.categories) ? post.categories.join(', ') : post.categories}
                        onChange={(e) => {
                          const categories = e.target.value.split(',').map(cat => cat.trim()).filter(cat => cat);
                          setPost(prev => ({ ...prev, categories }));
                        }}
                        placeholder="Categoria 1, Categoria 2, Categoria 3"
                      />
                      <div className="form-text">Separe as categorias por vírgula</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select
                        className="form-select"
                        id="status"
                        name="status"
                        value={post.status}
                        onChange={handleInputChange}
                      >
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                        <option value="archived">Arquivado</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Conteúdo *</label>
                  
                  {/* Barra de ferramentas */}
                  <div className="editor-toolbar mb-2">
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => formatText('bold')}
                        title="Negrito"
                      >
                        <FaBold />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => formatText('italic')}
                        title="Itálico"
                      >
                        <FaItalic />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => formatText('underline')}
                        title="Sublinhado"
                      >
                        <FaUnderline />
                      </button>
                    </div>
                    
                    <div className="btn-group ms-2" role="group">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => formatText('ul')}
                        title="Lista não ordenada"
                      >
                        <FaListUl />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => formatText('ol')}
                        title="Lista ordenada"
                      >
                        <FaListOl />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => formatText('quote')}
                        title="Citação"
                      >
                        <FaQuoteLeft />
                      </button>
                    </div>
                  </div>
                  
                  {/* Área de edição */}
                  <textarea
                    className="form-control"
                    id="content"
                    name="content"
                    rows="15"
                    value={post.content}
                    onChange={handleInputChange}
                    required
                    style={{ fontFamily: 'Georgia, Times New Roman, serif', fontSize: '16px', lineHeight: '1.6' }}
                  />
                  
                  <div className="form-text">
                    Dica: Selecione o texto e use os botões acima para formatar. Você pode usar HTML diretamente.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Configurações</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Categoria</label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={post.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Política">Política</option>
                    <option value="Economia">Economia</option>
                    <option value="Esportes">Esportes</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Cultura">Cultura</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="author" className="form-label">Autor</label>
                  <input
                    type="text"
                    className="form-control"
                    id="author"
                    name="author"
                    value={post.author}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="published" className="form-label">Data de Publicação</label>
                  <input
                    type="date"
                    className="form-control"
                    id="published"
                    name="published"
                    value={post.published}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Imagens</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="images" className="form-label">
                    <FaImage className="me-2" />
                    Adicionar Imagens
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                {post.images.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Imagens da Notícia</label>
                    <div className="row g-2">
                      {post.images.map((image, index) => (
                        <div key={index} className="col-6">
                          <div className="position-relative">
                            <img
                              src={image}
                              alt={`Imagem ${index + 1}`}
                              className="img-fluid rounded"
                              style={{ height: '100px', objectFit: 'cover', width: '100%' }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              style={{ margin: '2px' }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminEditarNoticia; 