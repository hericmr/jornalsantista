import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaTimes, FaSave } from 'react-icons/fa';

const AdminNovaNoticia = () => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = () => {
    setSaving(true);
    // Simulate saving logic
    setTimeout(() => {
      setSaving(false);
      navigate('/admin/noticias');
    }, 1000);
  };

  return (
    <div className="admin-editar-noticia">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Nova Notícia</h2>
        <div>
          <a href="/" className="btn btn-outline-dark me-2" target="_blank" rel="noopener noreferrer">
            Voltar para o site
          </a>
          <button onClick={() => setShowPreview((v) => !v)} className="btn btn-outline-info me-2" type="button">
            <FaEye /> Preview
          </button>
          <button onClick={() => navigate('/admin/noticias')} className="btn btn-outline-secondary me-2" type="button">
            <FaTimes /> Cancelar
          </button>
          <button onClick={handleSubmit} className="btn btn-success" disabled={saving} type="submit">
            <FaSave /> Salvar
          </button>
        </div>
      </div>
      {showPreview && (
        <div className="preview-container">
          <h3>Preview da Notícia</h3>
          <p>Conteúdo da notícia aqui...</p>
        </div>
      )}
    </div>
  );
};

export default AdminNovaNoticia; 