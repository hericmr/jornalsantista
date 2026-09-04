import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef
} from 'react';

// Feedback do painel admin: toasts (aviso não bloqueante) e diálogo de
// confirmação com Promise — substitutos de window.alert / window.confirm.
//
// Uso:
//   const toast = useToast();
//   toast.success('Notícia salva');
//   toast.error('Falha ao salvar: ' + err.message);
//
//   const confirm = useConfirm();
//   if (await confirm({ message: 'Excluir esta matéria?', variant: 'danger' })) { ... }

const ToastCtx = createContext(null);
const ConfirmCtx = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast precisa estar dentro de <AdminFeedbackProvider>');
  return ctx;
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm precisa estar dentro de <AdminFeedbackProvider>');
  return ctx;
};

let nextId = 1;

export const AdminFeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const confirmBtnRef = useRef(null);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', opts = {}) => {
      const id = nextId++;
      const timeout = opts.timeout ?? (type === 'error' ? 7000 : 4000);
      setToasts((list) => [...list, { id, message, type }]);
      if (timeout > 0) setTimeout(() => dismiss(id), timeout);
      return id;
    },
    [dismiss]
  );

  const toast = useRef({
    success: (m, o) => showToast(m, 'success', o),
    error: (m, o) => showToast(m, 'error', o),
    info: (m, o) => showToast(m, 'info', o),
    show: showToast
  }).current;

  const confirm = useCallback(
    (opts = {}) =>
      new Promise((resolve) => {
        setDialog({
          title: opts.title || 'Confirmar',
          message: opts.message || '',
          confirmLabel: opts.confirmLabel || 'Confirmar',
          cancelLabel: opts.cancelLabel || 'Cancelar',
          variant: opts.variant || 'primary',
          resolve
        });
      }),
    []
  );

  const closeDialog = useCallback(
    (result) => {
      setDialog((d) => {
        if (d) d.resolve(result);
        return null;
      });
    },
    []
  );

  // Esc fecha o diálogo; foco vai para o botão de confirmar ao abrir.
  useEffect(() => {
    if (!dialog) return;
    confirmBtnRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') closeDialog(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dialog, closeDialog]);

  return (
    <ToastCtx.Provider value={toast}>
      <ConfirmCtx.Provider value={confirm}>
        {children}

        <div className="admin-toasts" aria-live="polite" aria-atomic="false">
          {toasts.map((t) => (
            <div key={t.id} className={`admin-toast admin-toast--${t.type}`} role="status">
              <span className="admin-toast__icon" aria-hidden="true">
                {t.type === 'success' ? '✓' : t.type === 'error' ? '!' : 'i'}
              </span>
              <span className="admin-toast__msg">{t.message}</span>
              <button
                type="button"
                className="admin-toast__close"
                aria-label="Fechar aviso"
                onClick={() => dismiss(t.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {dialog && (
          <div className="admin-dialog-backdrop" onClick={() => closeDialog(false)}>
            <div
              className="admin-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-dialog-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="admin-dialog-title" className="admin-dialog__title">
                {dialog.title}
              </h3>
              {dialog.message && <p className="admin-dialog__msg">{dialog.message}</p>}
              <div className="admin-dialog__actions">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => closeDialog(false)}
                >
                  {dialog.cancelLabel}
                </button>
                <button
                  ref={confirmBtnRef}
                  type="button"
                  className={`btn btn-${dialog.variant}`}
                  onClick={() => closeDialog(true)}
                >
                  {dialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
};

export default AdminFeedbackProvider;
