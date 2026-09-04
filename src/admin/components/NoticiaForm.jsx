import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSave,
  FaTimes,
  FaImage,
  FaUndo,
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaQuoteLeft
} from 'react-icons/fa';
import { useNoticiaForm } from '../hooks/useNoticiaForm';

// Formulário único de matéria — usado por "Nova notícia" e "Editar notícia".
const NoticiaForm = ({ mode, id }) => {
  const navigate = useNavigate();
  const {
    isEdit,
    post,
    setPost,
    handleChange,
    setCategoriesFromText,
    allAuthors,
    addAuthor,
    removeAuthor,
    selectedFiles,
    setSelectedFiles,
    uploadSelectedImages,
    removeImage,
    loading,
    saving,
    submit,
    restoreBackup,
    backupAvailable
  } = useNoticiaForm({ mode, id });

  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const [newAuthor, setNewAuthor] = useState('');

  // Envolve a seleção do textarea com uma marcação HTML simples.
  const formatText = (command) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    const wrap = {
      bold: `<strong>${selected}</strong>`,
      italic: `<em>${selected}</em>`,
      underline: `<u>${selected}</u>`,
      ul: `<ul>\n<li>${selected}</li>\n</ul>`,
      ol: `<ol>\n<li>${selected}</li>\n</ol>`,
      quote: `<blockquote>${selected}</blockquote>`
    };
    const formatted = wrap[command] ?? selected;

    const next =
      textarea.value.substring(0, start) +
      formatted +
      textarea.value.substring(end);
    setPost((prev) => ({ ...prev, content: next }));

    setTimeout(() => {
      textarea.focus();
      const caret = start + formatted.length;
      textarea.setSelectionRange(caret, caret);
    }, 0);
  };

  const submitNewAuthor = () => {
    addAuthor(newAuthor);
    setNewAuthor('');
  };

  const handleImageChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    await uploadSelectedImages();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '400px' }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-editar-noticia">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEdit ? 'Editar Notícia' : 'Nova Notícia'}</h2>
        <div>
          <a
            href="/"
            className="btn btn-outline-dark me-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Voltar para o site
          </a>
          {isEdit && (
            <button
              type="button"
              onClick={restoreBackup}
              disabled={saving || !backupAvailable}
              className="btn btn-outline-danger me-2"
              title={
                backupAvailable
                  ? 'Restaura o corpo da matéria à versão anterior ao último salvamento'
                  : 'Nenhum salvamento anterior para desfazer'
              }
            >
              <FaUndo className="me-2" />
              Desfazer último salvamento
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/admin/noticias')}
            className="btn btn-outline-secondary me-2"
          >
            <FaTimes className="me-2" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="btn btn-primary"
          >
            <FaSave className="me-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <form onSubmit={submit}>
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Conteúdo da Notícia</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Título *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={post.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="excerpt" className="form-label">
                    Resumo
                  </label>
                  <textarea
                    className="form-control"
                    id="excerpt"
                    name="excerpt"
                    rows="3"
                    value={post.excerpt}
                    onChange={handleChange}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="categories" className="form-label">
                        Categorias
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="categories"
                        name="categories"
                        value={
                          Array.isArray(post.categories)
                            ? post.categories.join(', ')
                            : post.categories
                        }
                        onChange={(e) => setCategoriesFromText(e.target.value)}
                        placeholder="Categoria 1, Categoria 2, Categoria 3"
                      />
                      <div className="form-text">
                        Separe as categorias por vírgula
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">
                        Status
                      </label>
                      <select
                        className="form-select"
                        id="status"
                        name="status"
                        value={post.status}
                        onChange={handleChange}
                      >
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                        <option value="archived">Arquivado</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="content" className="form-label">
                    Conteúdo *
                  </label>

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

                  <textarea
                    ref={contentRef}
                    className="form-control"
                    id="content"
                    name="content"
                    rows="15"
                    value={post.content}
                    onChange={handleChange}
                    required
                    style={{
                      fontFamily: 'Georgia, Times New Roman, serif',
                      fontSize: '16px',
                      lineHeight: '1.6'
                    }}
                  />

                  <div className="form-text">
                    Dica: Selecione o texto e use os botões acima para formatar.
                    Você pode usar HTML diretamente.
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
                  <label htmlFor="authors" className="form-label">
                    Autores
                  </label>
                  <div
                    className="multi-author-selector"
                    key={`authors-selector-${post.authors.join('-')}`}
                  >
                    <div className="selected-authors mb-2">
                      {post.authors && post.authors.length > 0 ? (
                        post.authors.map((author, index) => (
                          <span
                            key={`author-${index}-${author}`}
                            className="badge bg-primary me-1 mb-1"
                          >
                            {author}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-1"
                              style={{ fontSize: '0.6rem' }}
                              onClick={() => removeAuthor(index)}
                            ></button>
                          </span>
                        ))
                      ) : (
                        <div className="text-muted small">
                          Nenhum autor selecionado
                        </div>
                      )}
                    </div>

                    <select
                      className="form-select mb-2"
                      value=""
                      onChange={(e) => {
                        addAuthor(e.target.value);
                        e.target.value = '';
                      }}
                    >
                      <option value="">Selecionar autor conhecido</option>
                      {allAuthors.map((author) => (
                        <option key={author} value={author}>
                          {author}
                        </option>
                      ))}
                    </select>

                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ou digite nome de novo autor"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            submitNewAuthor();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={submitNewAuthor}
                      >
                        Adicionar
                      </button>
                    </div>
                    <div className="form-text">
                      Selecione autores da lista ou digite novos nomes. Pressione
                      Enter ou clique em Adicionar.
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="published" className="form-label">
                    Data de Publicação
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="published"
                    name="published"
                    value={post.published}
                    onChange={handleChange}
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
                      ref={fileInputRef}
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
                      onClick={handleUpload}
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
                              alt={`${post.title || 'Notícia'} - Imagem ${
                                index + 1
                              }`}
                              className="img-fluid rounded"
                              style={{
                                height: '100px',
                                objectFit: 'cover',
                                width: '100%'
                              }}
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

export default NoticiaForm;
