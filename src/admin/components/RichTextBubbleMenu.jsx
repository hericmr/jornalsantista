import React from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import { useEditorState } from '@tiptap/react';
import { FaBold, FaItalic, FaHeading } from 'react-icons/fa';
import { ToolbarButton, LinkControl } from './RichTextToolbar';

// Menu flutuante de seleção (E2/T2.4): aparece perto do texto selecionado,
// com as marcas mais usadas — negrito, itálico, link e intertítulo (H2).
// A barra fixa (RichTextToolbar) continua com o conjunto completo.
const RichTextBubbleMenu = ({ editor }) => {
  const state = useEditorState({
    editor,
    selector: ({ editor: ed }) => ({
      bold: ed.isActive('bold'),
      italic: ed.isActive('italic'),
      heading2: ed.isActive('heading', { level: 2 }),
      link: ed.isActive('link'),
      linkHref: ed.getAttributes('link').href || ''
    })
  });

  return (
    <BubbleMenu editor={editor} className="richtext-bubble-menu">
      <ToolbarButton
        variant="bubble"
        label="Negrito"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <FaBold />
      </ToolbarButton>
      <ToolbarButton
        variant="bubble"
        label="Itálico"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <FaItalic />
      </ToolbarButton>
      <ToolbarButton
        variant="bubble"
        label="Intertítulo"
        title="Intertítulo (H2)"
        active={state.heading2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <FaHeading />
      </ToolbarButton>
      <LinkControl editor={editor} active={state.link} href={state.linkHref} variant="bubble" />
    </BubbleMenu>
  );
};

export default RichTextBubbleMenu;
