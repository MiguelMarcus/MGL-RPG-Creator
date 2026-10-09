"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { descriptionFonts, richTextHTML } from "../../../back/odc.mjs";

function ToolButton({ label, active = false, children, onClick }) {
  return <button type="button" className={`rich-tool${active ? " is-active" : ""}`} title={label} aria-label={label} aria-pressed={active} onMouseDown={event => event.preventDefault()} onClick={onClick}>{children}</button>;
}

function applyToCursorBlock(editor, action) {
  if (!editor) return;
  action(editor.chain().focus()).run();
}

function RichToolbar({ editor, onLink, font, onFontChange }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      paragraph: current?.isActive("paragraph") || false,
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
      <ToolButton label="Texto normal no parágrafo atual" active={state.paragraph} onClick={() => applyToCursorBlock(editor, chain => chain.setParagraph())}>¶</ToolButton>
      <ToolButton label="Título no parágrafo atual" active={state.heading2} onClick={() => applyToCursorBlock(editor, chain => chain.setHeading({ level: 2 }))}>H₂</ToolButton>
      <ToolButton label="Subtítulo no parágrafo atual" active={state.heading3} onClick={() => applyToCursorBlock(editor, chain => chain.setHeading({ level: 3 }))}>H₃</ToolButton>
      <ToolButton label="Lista a partir do parágrafo atual" active={state.bulletList} onClick={() => applyToCursorBlock(editor, chain => chain.toggleBulletList())}>☷</ToolButton>
      <ToolButton label="Lista numerada a partir do parágrafo atual" active={state.orderedList} onClick={() => applyToCursorBlock(editor, chain => chain.toggleOrderedList())}>1.</ToolButton>
      <ToolButton label="Citação do parágrafo atual" active={state.quote} onClick={() => applyToCursorBlock(editor, chain => chain.toggleBlockquote())}>❝</ToolButton>
      <ToolButton label="Inserir linha no parágrafo atual" onClick={() => applyToCursorBlock(editor, chain => chain.setHorizontalRule())}>―</ToolButton>
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
    <label className="rich-font-picker" title="Aplicar a fonte em todas as descrições">
      <span>Fonte</span>
      <select aria-label="Fonte para todas as descrições" value={font || "georgia"} onChange={event => onFontChange?.(event.target.value)}>
        {descriptionFonts.map(item => <option key={item.id} value={item.id} style={{ fontFamily: item.css }}>{item.name}</option>)}
      </select>
    </label>
    <span className="rich-toolbar-count">{state.words} {state.words === 1 ? "palavra" : "palavras"}</span>
  </div>;
}

export default function RichTextEditor({ value = "", onChange, font = "georgia", fontFamily = "Georgia, serif", onFontChange, placeholder = "Escreva sua descrição…", minHeight = "220px" }) {
  const onChangeRef = useRef(onChange);
  const lastContentRef = useRef(richTextHTML(value) || "<p></p>");
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
    editable: true,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-content",
        "aria-label": "Descrição",
        "aria-multiline": "true",
        "tabindex": "0",
        "spellcheck": "true",
      },
      transformPastedText(text) { return text; },
    },
    onUpdate({ editor: current }) {
      const nextContent = richTextHTML(current.getHTML()) || "<p></p>";
      lastContentRef.current = nextContent;
      onChangeRef.current?.(nextContent);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const nextContent = richTextHTML(value) || "<p></p>";
    if (nextContent !== lastContentRef.current) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
      lastContentRef.current = nextContent;
    }
  }, [editor, value]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const current = editor.getAttributes("link").href || "https://";
    const url = window.prompt("Endereço do link:", current);
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  return <div className="rich-editor" style={{ "--rich-editor-min-height": minHeight, "--rich-editor-font": fontFamily }}>
    <RichToolbar editor={editor} onLink={addLink} font={font} onFontChange={onFontChange} />
    <EditorContent editor={editor} />
  </div>;
}
