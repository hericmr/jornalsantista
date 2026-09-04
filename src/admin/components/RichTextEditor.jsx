import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import RichTextToolbar from './RichTextToolbar';

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
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
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

  // Sincroniza quando `value` muda por fora (trocar de matéria, "reparar
  // texto puro" em T4.2, "desfazer último salvamento" em T1.4) sem mexer no
  // cursor durante a digitação normal (aí `value` e o HTML do editor já
  // coincidem, então o `if` abaixo não faz nada).
  useEffect(() => {
    if (!editor || value === undefined) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="richtext-editor-shell">
      <RichTextToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
