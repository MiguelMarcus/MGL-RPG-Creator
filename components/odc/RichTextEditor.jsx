"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { richTextHTML } from "../../lib/odc.mjs";

function ToolButton({ label, active = false, disabled = false, children, onClick }) {
  return <button type="button" className={`rich-tool${active ? " is-active" : ""}`} title={label} aria-label={label} aria-pressed={active} disabled={disabled} onMouseDown={event => event.preventDefault()} onClick={onClick}>{children}</button>;
}

export default function RichTextEditor({ value = "", onChange, placeholder = "Escreva sua descrição…", minHeight = "140px" }) {
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

  useEffect(() => {
    if (!editor) return;
    const next = richTextHTML(value);
    const current = editor.isEmpty ? "" : richTextHTML(editor.getHTML());
    if (next !== current) editor.commands.setContent(next || "<p></p>", { emitUpdate: false });
  }, [editor, value]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const current = editor.getAttributes("link").href || "https://";
    const url = window.prompt("Endereço do link:", current);
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  const wordCount = editor?.getText().trim().split(/\s+/).filter(Boolean).length || 0;
  return <div className="rich-editor" style={{ "--rich-editor-min-height": minHeight }}>
    <div className="rich-toolbar" role="toolbar" aria-label="Formatação da descrição">
      <div className="rich-tool-group" aria-label="Histórico">
        <ToolButton label="Desfazer" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>↶</ToolButton>
        <ToolButton label="Refazer" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>↷</ToolButton>
      </div>
      <span className="rich-separator" aria-hidden="true" />
      <div className="rich-tool-group" aria-label="Blocos">
        <ToolButton label="Título" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H₂</ToolButton>
        <ToolButton label="Subtítulo" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H₃</ToolButton>
        <ToolButton label="Lista com marcadores" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>☷</ToolButton>
        <ToolButton label="Lista numerada" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1.</ToolButton>
        <ToolButton label="Citação" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>❝</ToolButton>
        <ToolButton label="Linha horizontal" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>―</ToolButton>
      </div>
      <span className="rich-separator" aria-hidden="true" />
      <div className="rich-tool-group" aria-label="Texto">
        <ToolButton label="Negrito" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}><strong>B</strong></ToolButton>
        <ToolButton label="Itálico" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}><em>I</em></ToolButton>
        <ToolButton label="Tachado" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()}><s>S</s></ToolButton>
        <ToolButton label="Código" active={editor?.isActive("code")} onClick={() => editor?.chain().focus().toggleCode().run()}>&lt;/&gt;</ToolButton>
        <ToolButton label="Sublinhado" active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}><u>U</u></ToolButton>
        <ToolButton label="Inserir ou editar link" active={editor?.isActive("link")} onClick={addLink}>↗</ToolButton>
        <ToolButton label="Sobrescrito" active={editor?.isActive("superscript")} onClick={() => editor?.chain().focus().toggleSuperscript().run()}>x²</ToolButton>
        <ToolButton label="Subscrito" active={editor?.isActive("subscript")} onClick={() => editor?.chain().focus().toggleSubscript().run()}>x₂</ToolButton>
      </div>
      <span className="rich-toolbar-count">{wordCount} {wordCount === 1 ? "palavra" : "palavras"}</span>
    </div>
    <EditorContent editor={editor} />
  </div>;
}
