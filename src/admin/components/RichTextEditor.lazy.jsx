import React, { Suspense, lazy } from 'react';

// Wrapper de carregamento tardio: o chunk do TipTap (RichTextEditor.jsx e as
// dependências @tiptap/*) só é baixado quando este componente é montado —
// ou seja, só nas telas de criar/editar matéria do admin. O site público
// nunca importa este arquivo.
const RichTextEditor = lazy(() => import('./RichTextEditor'));

const RichTextEditorFallback = () => (
  <div
    className="richtext-editor-loading d-flex align-items-center justify-content-center"
    role="status"
  >
    <div className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
    <span>Carregando editor…</span>
  </div>
);

const LazyRichTextEditor = (props) => (
  <Suspense fallback={<RichTextEditorFallback />}>
    <RichTextEditor {...props} />
  </Suspense>
);

export default LazyRichTextEditor;
