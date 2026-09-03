import React, { useState } from 'react';
import { SITE } from '../config/site';

// NOTE(Fase 5.10): substituir este modal bloqueante por uma faixa inferior
// dispensável. Por ora, apenas garantimos que nenhum dado vai para serviço
// de terceiros indevido (antes o form apontava para a lista do The Intercept).
const NewsletterModal = ({ onClose }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const address = email.trim();
    if (!address) return;
    const subject = encodeURIComponent('Inscrição na newsletter');
    const body = encodeURIComponent(
      `Quero receber a newsletter do ${SITE.name}.\nE-mail: ${address}`
    );
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <div
      className="newsletter-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Inscrição na newsletter"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div className="bg-white p-4 rounded shadow position-relative" style={{ maxWidth: 420, width: '100%' }}>
        <button
          type="button"
          className="btn btn-link position-absolute top-0 end-0 fs-3 text-decoration-none"
          onClick={onClose}
          aria-label="Fechar"
          style={{ border: 'none', background: 'none' }}
        >
          &times;
        </button>
        <h2 className="h4">Receba nossas notícias por e-mail</h2>
        <p className="text-muted">É grátis e você pode cancelar quando quiser.</p>
        <form onSubmit={handleSubmit}>
          <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
            <input
              type="email"
              autoComplete="email"
              className="form-control"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-dark">
              Inscrever
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsletterModal;
