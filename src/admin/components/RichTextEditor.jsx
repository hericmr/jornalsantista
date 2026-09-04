import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import RichTextToolbar from './RichTextToolbar';
import RichTextBubbleMenu from './RichTextBubbleMenu';

// Editor richtext do corpo da matéria (TipTap). Carregado sob demanda — ver
// RichTextEditor.lazy.jsx — para não pesar o bundle público.
//
// `value`/`onChange` controlam o HTML do corpo, do mesmo jeito que o
// `<textarea>` que este componente substitui: `value` é a fonte da verdade
// externa (post.content); `onChange` recebe o HTML atualizado a cada edição.
const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Escreva o texto da matéria…'
}) => {
  // Marca se a próxima mudança de `value` veio do PRÓPRIO editor (o usuário
  // digitou → onUpdate → onChange → o pai guarda em post.content → volta
  // aqui como prop). Nesse caso não precisa (e não deve) re-sincronizar.
  // Só re-sincroniza quando `value` muda por FORA (trocar de matéria,
  // "reparar texto puro" em T4.2, "desfazer último salvamento" em T1.4).
  //
  // Importante: o efeito de sincronização NÃO chama editor.getHTML() para
  // comparar — chamar um método do editor de forma reativa a cada render é
  // arriscado (o editor pode estar sendo destruído/recriado nesse instante,
  // por exemplo ao navegar para fora da tela, e a chamada quebra com "schema
  // nulo", travando a página inteira sem error boundary). A ref evita
  // precisar chamar getHTML() aqui.
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }
        }
      }),
      Image,
      Placeholder.configure({ placeholder })
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      if (ed.isDestroyed) return;
      isInternalUpdate.current = true;
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        id: 'content',
        class: 'richtext-editor',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-required': 'true',
        'aria-label': 'Conteúdo da matéria'
      }
    }
  });

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (!editor || editor.isDestroyed || value === undefined) return;
    editor.commands.setContent(value || '', { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="richtext-editor-shell">
      <RichTextToolbar editor={editor} />
      <RichTextBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
