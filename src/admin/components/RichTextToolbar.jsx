import React, { useState } from 'react';
import { useEditorState } from '@tiptap/react';
import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaLink,
  FaUnlink,
  FaGripLines,
  FaEraser,
  FaUndo,
  FaRedo
} from 'react-icons/fa';

// Barra de formatação do editor richtext (E2/T2.3). Fica no NoticiaForm via
// RichTextEditor.jsx — sempre no mesmo componente que criou o `editor`
// (useEditor), para poder aplicar comandos nele.

const HEADING_LEVELS = [2, 3, 4];

// Só http(s) e mailto — mesmo critério do link inserido no corpo (E6 usa a
// mesma regra para imagens/embeds externos).
const isValidUrl = (value) => /^(https?:\/\/|mailto:)\S+$/i.test(value.trim());

// `variant` troca a aparência: "toolbar" (barra fixa, clara) ou "bubble"
// (menu flutuante escuro sobre a seleção — T2.4). Reaproveitado pelo
// RichTextBubbleMenu.
const VARIANT_CLASS = {
  toolbar: 'btn btn-outline-secondary btn-sm',
  bubble: 'richtext-bubble-btn'
};

export const ToolbarButton = ({
  onClick,
  active,
  disabled,
  label,
  title,
  variant = 'toolbar',
  children
}) => (
  <button
    type="button"
    className={`${VARIANT_CLASS[variant]}${active ? ' active' : ''}`}
    aria-pressed={!!active}
    aria-label={label}
    title={title || label}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

// Botão de link com popover próprio: campo de URL, validação de esquema
// (http/https/mailto) e opção de remover o link atual. Exportado para o
// RichTextBubbleMenu (T2.4) reaproveitar.
export const LinkControl = ({ editor, active, href, variant = 'toolbar' }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const openPopover = () => {
    setUrl(href || '');
    setError('');
    setOpen((o) => !o);
  };

  const apply = () => {
    const value = url.trim();
    if (!value) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setOpen(false);
      return;
    }
    if (!isValidUrl(value)) {
      setError('Use um link http://, https:// ou mailto:');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: value }).run();
    setOpen(false);
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setOpen(false);
  };

  return (
    <div className="richtext-toolbar-link">
      <ToolbarButton label="Link" active={active} variant={variant} onClick={openPopover}>
        <FaLink />
      </ToolbarButton>
      {open && (
        <div className="richtext-toolbar-link-popover" role="dialog" aria-label="Inserir link">
          <label htmlFor="richtext-link-url" className="visually-hidden">
            Endereço do link
          </label>
          <input
            id="richtext-link-url"
            type="url"
            className="form-control form-control-sm"
            placeholder="https://…"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                apply();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
              }
            }}
            autoFocus
          />
          <div className="richtext-toolbar-link-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={apply}>
              Aplicar
            </button>
            {active && (
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={remove}>
                <FaUnlink className="me-1" />
                Remover
              </button>
            )}
          </div>
          {error && (
            <div className="richtext-toolbar-link-error" role="alert">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RichTextToolbar = ({ editor }) => {
  const state = useEditorState({
    editor,
    selector: ({ editor: ed }) => ({
      bold: ed.isActive('bold'),
      italic: ed.isActive('italic'),
      strike: ed.isActive('strike'),
      h2: ed.isActive('heading', { level: 2 }),
      h3: ed.isActive('heading', { level: 3 }),
      h4: ed.isActive('heading', { level: 4 }),
      bulletList: ed.isActive('bulletList'),
      orderedList: ed.isActive('orderedList'),
      blockquote: ed.isActive('blockquote'),
      link: ed.isActive('link'),
      linkHref: ed.getAttributes('link').href || '',
      canUndo: ed.can().undo(),
      canRedo: ed.can().redo()
    })
  });

  // Remove só marcas inline (negrito, itálico, riscado, link, sublinhado) e
  // rebaixa heading para parágrafo; não mexe em listas/citações (D5).
  const clearFormatting = () => {
    const chain = editor.chain().focus().unsetAllMarks();
    if (editor.isActive('heading')) chain.setParagraph();
    chain.run();
  };

  return (
    <div className="richtext-toolbar" role="toolbar" aria-label="Formatação do texto">
      <div className="btn-group" role="group" aria-label="Marcas">
        <ToolbarButton
          label="Negrito"
          active={state.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FaBold />
        </ToolbarButton>
        <ToolbarButton
          label="Itálico"
          active={state.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FaItalic />
        </ToolbarButton>
        <ToolbarButton
          label="Riscado"
          active={state.strike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <FaStrikethrough />
        </ToolbarButton>
      </div>

      <div className="btn-group ms-2" role="group" aria-label="Intertítulos">
        {HEADING_LEVELS.map((level) => (
          <ToolbarButton
            key={level}
            label={`Intertítulo H${level}`}
            active={state[`h${level}`]}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          >
            H{level}
          </ToolbarButton>
        ))}
      </div>

      <div className="btn-group ms-2" role="group" aria-label="Listas e citação">
        <ToolbarButton
          label="Lista não ordenada"
          active={state.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FaListUl />
        </ToolbarButton>
        <ToolbarButton
          label="Lista ordenada"
          active={state.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FaListOl />
        </ToolbarButton>
        <ToolbarButton
          label="Citação em bloco"
          active={state.blockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <FaQuoteRight />
        </ToolbarButton>
      </div>

      <div className="btn-group ms-2" role="group" aria-label="Link e linha divisória">
        <LinkControl editor={editor} active={state.link} href={state.linkHref} />
        <ToolbarButton
          label="Linha divisória"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <FaGripLines />
        </ToolbarButton>
      </div>

      <div className="btn-group ms-2" role="group" aria-label="Limpar e histórico">
        <ToolbarButton label="Limpar formatação" onClick={clearFormatting}>
          <FaEraser />
        </ToolbarButton>
        <ToolbarButton
          label="Desfazer"
          disabled={!state.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <FaUndo />
        </ToolbarButton>
        <ToolbarButton
          label="Refazer"
          disabled={!state.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <FaRedo />
        </ToolbarButton>
      </div>
    </div>
  );
};

export default RichTextToolbar;
