import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaImage, FaLink, FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaQuoteLeft } from 'react-icons/fa';
import { savePost } from '../../lib/postsService';
import { slugify } from '../../utils/textUtils';
import { supabase } from '../../lib/supabase';

const AdminNovaNoticia = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    categories: [],
    authors: [],
    published: '',
    images: [],
    tags: [],
    status: 'draft'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Upload para Supabase
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const uploadedUrls = [];
      
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setPost(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      
      setSelectedFiles([]);
      document.getElementById('images').value = '';
      
      console.log('Imagens enviadas:', uploadedUrls);
    } catch (error) {
      console.error('Erro ao enviar imagens:', error);
      alert('Erro ao enviar imagens: ' + error.message);
    }
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
        text_content: post.content,
        categories: post.categories,
        authors: post.authors,
        author: post.authors.length > 0 ? post.authors.join(', ') : '', // Para compatibilidade
        published_at: post.published ? new Date(post.published).toISOString() : null,
        images: post.images,
        tags: post.tags,
        status: post.status,
        slug: slugify(post.title)
      };

      console.log('📝 Dados a serem salvos:', postData);

      await savePost(postData, true);
      alert('Notícia criada com sucesso!');
      navigate('/admin/noticias');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar a notícia: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Funções para formatação de texto
  const formatText = (command) => {
    const textarea = document.getElementById('content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch (command) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'ul':
        formattedText = `<ul>\n<li>${selectedText}</li>\n</ul>`;
        break;
      case 'ol':
        formattedText = `<ol>\n<li>${selectedText}</li>\n</ol>`;
        break;
      case 'quote':
        formattedText = `<blockquote>${selectedText}</blockquote>`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    setPost(prev => ({ ...prev, content: newValue }));
    
    // Reposicionar cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  return (
    <div className="admin-editar-noticia">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Nova Notícia</h2>
        <div>
          <a href="/" className="btn btn-outline-dark me-2" target="_blank" rel="noopener noreferrer">
            Voltar para o site
          </a>
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
                  <label htmlFor="authors" className="form-label">Autores</label>
                  <div className="multi-author-selector" key={`authors-selector-${post.authors.join('-')}`}>
                    {/* Lista de autores selecionados */}
                    <div className="selected-authors mb-2">
                      {console.log('🎨 AdminNew - Rendering badges for authors:', post.authors)}
                      {post.authors && post.authors.length > 0 ? (
                        post.authors.map((author, index) => (
                          <span key={`author-${index}-${author}`} className="badge bg-primary me-1 mb-1">
                            {author}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-1"
                              style={{ fontSize: '0.6rem' }}
                              onClick={() => {
                                console.log('🗑️ AdminNew - Removing author:', author);
                                const newAuthors = post.authors.filter((_, i) => i !== index);
                                console.log('🗑️ AdminNew - Authors after removal:', newAuthors);
                                setPost(prev => ({ ...prev, authors: newAuthors }));
                              }}
                            ></button>
                          </span>
                        ))
                      ) : (
                        <div className="text-muted small">Nenhum autor selecionado</div>
                      )}
                    </div>
                    
                    {/* Seletor de autores predefinidos */}
                    <select
                      className="form-select mb-2"
                      onChange={(e) => {
                        console.log('🔧 AdminNew - Select value:', e.target.value);
                        console.log('🔧 AdminNew - Current authors:', post.authors);
                        
                        if (e.target.value && !post.authors.includes(e.target.value)) {
                          const newAuthors = [...post.authors, e.target.value];
                          console.log('🔧 AdminNew - New authors array:', newAuthors);
                          
                          setPost(prev => ({ 
                            ...prev, 
                            authors: newAuthors
                          }));
                        }
                        e.target.value = '';
                      }}
                    >
                      <option value="">Selecionar autor conhecido</option>
                      <option value="Héric Moura">Héric Moura</option>
                      <option value="Walter Parreira">Walter Parreira</option>
                      <option value="Marcos de Paula">Marcos de Paula</option>
                      <option value="Darlene Regina">Darlene Regina</option>
                    </select>
                    
                    {/* Campo para adicionar novo autor */}
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ou digite nome de novo autor"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const newAuthor = e.target.value.trim();
                            if (newAuthor && !post.authors.includes(newAuthor)) {
                              setPost(prev => ({ 
                                ...prev, 
                                authors: [...prev.authors, newAuthor] 
                              }));
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          const newAuthor = input.value.trim();
                          if (newAuthor && !post.authors.includes(newAuthor)) {
                            setPost(prev => ({ 
                              ...prev, 
                              authors: [...prev.authors, newAuthor] 
                            }));
                            input.value = '';
                          }
                        }}
                      >
                        Adicionar
                      </button>
                    </div>
                    <div className="form-text">
                      Selecione autores da lista ou digite novos nomes. Pressione Enter ou clique em Adicionar.
                    </div>
                  </div>
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
                  <div className="d-flex gap-2 align-items-center">
                    <input
                      type="file"
                      className="form-control"
                      id="images"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleUploadImages}
                      disabled={selectedFiles.length === 0}
                    >
                      Enviar Imagem{selectedFiles.length > 1 ? 's' : ''}
                    </button>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 small text-muted">
                      {selectedFiles.length} arquivo(s) selecionado(s)
                    </div>
                  )}
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
                              alt={`${post.title || 'Notícia'} - Imagem ${index + 1}`}
                              className="img-fluid rounded"
                              style={{ height: '100px', objectFit: 'cover', width: '100%' }}
                              loading="lazy"
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

export default AdminNovaNoticia; 