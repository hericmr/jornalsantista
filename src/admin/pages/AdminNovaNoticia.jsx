import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaImage, FaLink, FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaQuoteLeft } from 'react-icons/fa';
import { savePost } from '../../lib/postsService';
import { slugify } from '../../utils/textUtils';

const AdminNovaNoticia = () => {
  const navigate = useNavigate();
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
        text_content: post.content,
        categories: post.categories,
        author: post.author,
        published_at: post.published ? new Date(post.published).toISOString() : null,
        images: post.images,
        tags: post.tags,
        status: post.status,
        slug: slugify(post.title)
      };
      await savePost(postData, true);
      alert('Notícia criada com sucesso!');
      navigate('/admin/noticias');
    } catch (error) {
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
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + newText.length);
    }, 0);
  };

  return (
    <div className="admin-editar-noticia">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Nova Notícia</h2>
        <div>
          <button 
            onClick={() => navigate('/admin/noticias')}
            className="btn btn-outline-secondary me-2"
            type="button"
          >
            <FaTimes className="me-2" />
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="btn btn-primary"
            type="submit"
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
                        value={post.categories}
                        onChange={e => setPost(prev => ({ ...prev, categories: e.target.value.split(',').map(c => c.trim()) }))}
                        placeholder="Ex: Política, Cultura"
                      />
                      <div className="form-text">Separe por vírgula</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="author" className="form-label">Autor</label>
                      <input
                        type="text"
                        className="form-control"
                        id="author"
                        name="author"
                        value={post.author}
                        onChange={handleInputChange}
                        placeholder="Nome do autor"
                      />
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
                <div className="mb-3">
                  <label className="form-label">Imagens</label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {post.images.map((img, idx) => (
                      <div key={idx} className="position-relative">
                        <img src={img} alt="Prévia" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                        <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0" onClick={() => removeImage(idx)}>&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="tags" className="form-label">Tags</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tags"
                    name="tags"
                    value={post.tags}
                    onChange={e => setPost(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                    placeholder="Ex: Santos, Porto, Cultura"
                  />
                  <div className="form-text">Separe por vírgula</div>
                </div>
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
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Conteúdo *</label>
                  {/* Barra de ferramentas */}
                  <div className="editor-toolbar mb-2">
                    <div className="btn-group" role="group">
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => formatText('bold')} title="Negrito"><FaBold /></button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => formatText('italic')} title="Itálico"><FaItalic /></button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => formatText('underline')} title="Sublinhado"><FaUnderline /></button>
                    </div>
                    <div className="btn-group ms-2" role="group">
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => formatText('ul')} title="Lista não ordenada"><FaListUl /></button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => formatText('ol')} title="Lista ordenada"><FaListOl /></button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => formatText('quote')} title="Citação"><FaQuoteLeft /></button>
                    </div>
                  </div>
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
        </div>
      </form>
    </div>
  );
};

export default AdminNovaNoticia; 