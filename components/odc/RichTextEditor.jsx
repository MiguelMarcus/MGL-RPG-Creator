"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { richTextHTML } from "../../lib/odc.mjs";

function ToolButton({ label, active = false, children, onClick }) {
  return <button type="button" className={`rich-tool${active ? " is-active" : ""}`} title={label} aria-label={label} aria-pressed={active} onMouseDown={event => event.preventDefault()} onClick={onClick}>{children}</button>;
}

function RichToolbar({ editor, onLink }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      heading2: current?.isActive("heading", { level: 2 }) || false,
      heading3: current?.isActive("heading", { level: 3 }) || false,
      bulletList: current?.isActive("bulletList") || false,
      orderedList: current?.isActive("orderedList") || false,
      quote: current?.isActive("blockquote") || false,
      bold: current?.isActive("bold") || false,
      italic: current?.isActive("italic") || false,
      strike: current?.isActive("strike") || false,
      code: current?.isActive("code") || false,
      underline: current?.isActive("underline") || false,
      link: current?.isActive("link") || false,
      superscript: current?.isActive("superscript") || false,
      subscript: current?.isActive("subscript") || false,
      words: current?.getText().trim().split(/\s+/).filter(Boolean).length || 0,
    }),
  });
  return <div className="rich-toolbar" role="toolbar" aria-label="Formatação da descrição">
    <div className="rich-tool-group" aria-label="Blocos">
      <ToolButton label="Título" active={state.heading2} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H₂</ToolButton>
      <ToolButton label="Subtítulo" active={state.heading3} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H₃</ToolButton>
      <ToolButton label="Lista com marcadores" active={state.bulletList} onClick={() => editor?.chain().focus().toggleBulletList().run()}>☷</ToolButton>
      <ToolButton label="Lista numerada" active={state.orderedList} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1.</ToolButton>
      <ToolButton label="Citação" active={state.quote} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>❝</ToolButton>
      <ToolButton label="Linha horizontal" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>―</ToolButton>
    </div>
    <span className="rich-separator" aria-hidden="true" />
    <div className="rich-tool-group" aria-label="Texto">
      <ToolButton label="Negrito" active={state.bold} onClick={() => editor?.chain().focus().toggleBold().run()}><strong>B</strong></ToolButton>
      <ToolButton label="Itálico" active={state.italic} onClick={() => editor?.chain().focus().toggleItalic().run()}><em>I</em></ToolButton>
      <ToolButton label="Tachado" active={state.strike} onClick={() => editor?.chain().focus().toggleStrike().run()}><s>S</s></ToolButton>
      <ToolButton label="Código" active={state.code} onClick={() => editor?.chain().focus().toggleCode().run()}>&lt;/&gt;</ToolButton>
      <ToolButton label="Sublinhado" active={state.underline} onClick={() => editor?.chain().focus().toggleUnderline().run()}><u>U</u></ToolButton>
      <ToolButton label="Inserir ou editar link" active={state.link} onClick={onLink}>↗</ToolButton>
      <ToolButton label="Sobrescrito" active={state.superscript} onClick={() => editor?.chain().focus().toggleSuperscript().run()}>x²</ToolButton>
      <ToolButton label="Subscrito" active={state.subscript} onClick={() => editor?.chain().focus().toggleSubscript().run()}>x₂</ToolButton>
    </div>
    <span className="rich-toolbar-count">{state.words} {state.words === 1 ? "palavra" : "palavras"}</span>
  </div>;
}

export default function RichTextEditor({ value = "", onChange, placeholder = "Escreva sua descrição…", minHeight = "220px" }) {
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  const extensions = useMemo(() => [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Placeholder.configure({ placeholder }),
    Superscript,
    Subscript,
  ], [placeholder]);
  const editor = useEditor({
    extensions,
    content: richTextHTML(value) || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-content",
        "aria-label": "Descrição",
        "aria-multiline": "true",
      },
      transformPastedText(text) { return text; },
    },
    onUpdate({ editor: current }) { onChangeRef.current?.(richTextHTML(current.getHTML())); },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const current = editor.getAttributes("link").href || "https://";
    const url = window.prompt("Endereço do link:", current);
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  return <div className="rich-editor" style={{ "--rich-editor-min-height": minHeight }}>
    <RichToolbar editor={editor} onLink={addLink} />
    <EditorContent editor={editor} />
  </div>;
}
