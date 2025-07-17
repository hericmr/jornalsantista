import React from 'react';

const NewsletterModal = ({ onClose }) => (
  <div className="newsletter-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="single-newsletter__content bg-white p-4 rounded shadow position-relative" style={{ maxWidth: 420, width: '100%' }}>
      <button type="button" className="close-newsletter btn btn-link position-absolute top-0 end-0 fs-2" onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '2rem', right: 10, top: 10 }}>&times;</button>
      <h2>Inscreva-se na newsletter para continuar lendo. É grátis!</h2>
      <p>Este não é um acesso pago e a adesão é gratuita</p>
      <form className="single-newsletter__form newsletter-form-tib validate" action="https://theintercept.us11.list-manage.com/subscribe/post-json?c=?" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" target="_blank" noValidate>
        <input type="hidden" name="u" value="43fc0c0fce9292d8bed09ca27" />
        <input type="hidden" name="id" value="96fc3bd6d5" />
        <div className="d-flex flex-column flex-md-row mt-3 gap-3">
          <div className="input-group mb-0 border border-1 flex-12">
            <input type="email" name="MERGE0" autoComplete="email" className="newsletter-form-tib-email form-control bg-transparent border-0 required email" id="mc-embedded-subscribe-form_mce-EMAIL" placeholder="Insira seu e-mail" required />
          </div>
          <button type="submit" value="Enviar" name="subscribe" id="mc-embedded-subscribe-form_mc-embedded-subscribe" className="button newsletter-form-tib-submit btn btn-outline-primary d-flex align-items-center gap-2 flex-3 bg-primary text-white">Enviar <i className="bi bi-chevron-right"></i></button>
        </div>
        <div className="single-newsletter__check form-check mt-3">
          <input defaultChecked type="checkbox" className="newsletter-form-tib-check form-check-input av-checkbox aspect-1x1" value="Y" name="gdpr[72]" id="mc-embedded-subscribe-form_gdpr_72" />
          <label className="form-check-label form-default-sm-light text-primary" htmlFor="mc-embedded-subscribe-form_gdpr_72">
            Aceito receber e-mails e concordo com a Política de Privacidade e os Termos de Uso.
          </label>
        </div>
      </form>
      <p className="mt-3">Já se inscreveu? Confirme seu endereço de e-mail para continuar lendo</p>
      <div className="newsletter-feedback position-relative">
        <span className="newsletter-form-mensagem d-none position-absolute top-2 left-0 rounded-0">
          Cadastro enviado
        </span>
        <span className="newsletter-form-error-mensagem d-none position-absolute top-2 left-0 rounded-0">
        </span>
      </div>
    </div>
  </div>
);

export default NewsletterModal; 