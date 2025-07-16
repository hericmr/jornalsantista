import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaImage, FaLink } from 'react-icons/fa';
import { Editor, EditorProvider } from 'react-simple-wysiwyg';

const AdminEditarNoticia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    published: '',
    images: [],
    tags: []
  });

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      const response = await fetch('/blog_posts.json');
      const data = await response.json();
      // Aceita tanto {posts: [...]} quanto um array direto
      const posts = Array.isArray(data) ? data : data.posts;
      const foundPost = posts && posts.find(p => p.id === id);
      
      console.log('Post encontrado:', foundPost); // Debug
      console.log('text_content:', foundPost?.text_content); // Debug
      
      if (foundPost) {
        const postData = {
          title: foundPost.title || '',
          excerpt: foundPost.excerpt || '',
          content: foundPost.text_content || foundPost.content || '', // Corrigido para text_content
          category: foundPost.category || foundPost.categories?.[0] || '', // Corrigido para categories
          author: foundPost.author || '',
          published: foundPost.published ? new Date(foundPost.published).toISOString().split('T')[0] : '',
          images: foundPost.images || [],
          tags: foundPost.tags || []
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
      // Aqui você implementaria a lógica para salvar no backend
      console.log('Salvando post:', post);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Notícia salva com sucesso!');
      navigate('/admin/noticias');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar a notícia');
    } finally {
      setSaving(false);
    }
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

                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Conteúdo *</label>
                  <EditorProvider>
                    <Editor
                      value={post.content}
                      onChange={value => setPost(prev => ({ ...prev, content: value }))}
                      containerProps={{
                        style: {
                          border: '1px solid #ced4da',
                          borderRadius: '0.375rem',
                          minHeight: '350px'
                        }
                      }}
                    />
                  </EditorProvider>
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