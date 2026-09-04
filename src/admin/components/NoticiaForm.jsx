import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaImage, FaUndo, FaSlidersH } from 'react-icons/fa';
import { useNoticiaForm } from '../hooks/useNoticiaForm';
import RichTextEditor from './RichTextEditor.lazy';

// Formulário único de matéria — usado por "Nova notícia" e "Editar notícia".
//
// Layout (T2.6): coluna única para título + corpo (a escrita fica sem
// vizinhos), com os campos de metadados (resumo, categorias, status,
// autores, data, imagens) num painel "Detalhes" que abre sob demanda. Os
// campos em si — nome, comportamento, handlers — são exatamente os mesmos
// de antes; só a posição na tela mudou.
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

  const fileInputRef = useRef(null);
  const [newAuthor, setNewAuthor] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Esc fecha o painel de detalhes (mesmo padrão do diálogo de confirmação
  // em AdminFeedback.jsx).
  useEffect(() => {
    if (!detailsOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setDetailsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [detailsOpen]);

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
    <div className="admin-editar-noticia noticia-editor">
      <div className="noticia-editor-topbar">
        <button
          type="button"
          onClick={() => navigate('/admin/noticias')}
          className="btn btn-outline-secondary btn-sm"
        >
          <FaTimes className="me-2" />
          Cancelar
        </button>

        <span className="noticia-editor-kicker">
          {isEdit ? 'Editando matéria' : 'Nova matéria'}
        </span>

        <div className="noticia-editor-topbar-actions">
          <a
            href="/"
            className="btn btn-outline-secondary btn-sm d-none d-md-inline-flex"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver o site
          </a>
          {isEdit && (
            <button
              type="button"
              onClick={restoreBackup}
              disabled={saving || !backupAvailable}
              className="btn btn-outline-danger btn-sm"
              title={
                backupAvailable
                  ? 'Restaura o corpo da matéria à versão anterior ao último salvamento'
                  : 'Nenhum salvamento anterior para desfazer'
              }
            >
              <FaUndo className="me-2" />
              Desfazer
            </button>
          )}
          <button
            type="button"
            onClick={() => setDetailsOpen((o) => !o)}
            className={`btn btn-outline-light btn-sm${detailsOpen ? ' active' : ''}`}
            aria-pressed={detailsOpen}
            aria-expanded={detailsOpen}
            aria-controls="noticia-details-drawer"
          >
            <FaSlidersH className="me-2" />
            Detalhes
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="btn btn-primary btn-sm"
          >
            <FaSave className="me-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <form onSubmit={submit}>
        <div className="noticia-editor-page">
          <label htmlFor="title" className="visually-hidden">
            Título
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="noticia-editor-title"
            placeholder="Título da matéria"
            value={post.title}
            onChange={handleChange}
            required
          />

          <RichTextEditor
            value={post.content}
            onChange={(html) =>
              setPost((prev) => ({ ...prev, content: html }))
            }
          />
        </div>

        {detailsOpen && (
          <div
            className="noticia-details-backdrop"
            onClick={() => setDetailsOpen(false)}
          />
        )}

        <aside
          id="noticia-details-drawer"
          className={`noticia-details-drawer${detailsOpen ? ' open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Detalhes da matéria"
          aria-hidden={!detailsOpen}
        >
          <div className="noticia-details-header">
            <h5 className="mb-0">Detalhes da matéria</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Fechar detalhes"
              onClick={() => setDetailsOpen(false)}
            />
          </div>

          <div className="noticia-details-body">
            <section className="noticia-details-section">
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
            </section>

            <section className="noticia-details-section">
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
              <div className="form-text">Separe as categorias por vírgula</div>
            </section>

            <section className="noticia-details-section">
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
            </section>

            <section className="noticia-details-section">
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
            </section>

            <section className="noticia-details-section">
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
            </section>

            <section className="noticia-details-section">
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

              {post.images.length > 0 && (
                <div className="mt-3">
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
            </section>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default NoticiaForm;
