import React, { useState, useEffect } from 'react';
import { SITE } from '../config/site';

const KEY = 'newsletter_dismissed_at';
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

const dismissedRecently = () => {
  try {
    const ts = parseInt(localStorage.getItem(KEY) || '0', 10);
    return ts && Date.now() - ts < SNOOZE_MS;
  } catch {
    return false;
  }
};

// Faixa inferior dispensável (substitui o modal bloqueante).
const NewsletterBar = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (dismissedRecently()) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const address = email.trim();
    if (!address) return;
    const subject = encodeURIComponent('Inscrição na newsletter');
    const body = encodeURIComponent(
      `Quero receber a newsletter do ${SITE.name}.\nE-mail: ${address}`
    );
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    close();
  };

  if (!open) return null;

  return (
    <div className="newsletter-bar" role="region" aria-label="Newsletter">
      <div className="newsletter-bar-inner">
        <p className="newsletter-bar-text">
          <strong>Receba as notícias por e-mail.</strong> É grátis e sem spam.
        </p>
        <form className="newsletter-bar-form" onSubmit={submit}>
          <input
            type="email"
            autoComplete="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Seu e-mail"
            required
          />
          <button type="submit">Inscrever</button>
        </form>
        <button
          type="button"
          className="newsletter-bar-close"
          onClick={close}
          aria-label="Fechar"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default NewsletterBar;
