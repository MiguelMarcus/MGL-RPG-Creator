"use client";

import { useEffect, useRef } from "react";
import { richTextHTML } from "../../lib/odc.mjs";

const tools = [
  { label: "Desfazer", icon: "↶", command: "undo" },
  { label: "Refazer", icon: "↷", command: "redo" },
  { separator: true },
  { label: "Título", icon: "H₂", command: "formatBlock", value: "h2" },
  { label: "Lista com marcadores", icon: "☷", command: "insertUnorderedList" },
  { label: "Lista numerada", icon: "1.", command: "insertOrderedList" },
  { label: "Citação", icon: "❝", command: "formatBlock", value: "blockquote" },
  { label: "Linha horizontal", icon: "―", command: "insertHorizontalRule" },
  { separator: true },
  { label: "Negrito", icon: "B", command: "bold", className: "tool-bold" },
  { label: "Itálico", icon: "I", command: "italic", className: "tool-italic" },
  { label: "Tachado", icon: "S", command: "strikeThrough", className: "tool-strike" },
  { label: "Código", icon: "</>", command: "formatBlock", value: "pre" },
  { label: "Sublinhado", icon: "U", command: "underline", className: "tool-underline" },
  { label: "Inserir link", icon: "↗", command: "createLink" },
  { separator: true },
  { label: "Sobrescrito", icon: "x²", command: "superscript" },
  { label: "Subscrito", icon: "x₂", command: "subscript" },
];

export default function RichTextEditor({ value = "", onChange, placeholder = "Escreva a descrição...", minHeight = "140px" }) {
  const editorRef = useRef(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
    const editor = editorRef.current;
    if (editor && document.activeElement !== editor && editor.innerHTML !== richTextHTML(value)) {
      editor.innerHTML = richTextHTML(value);
    }
  }, [value]);

  const run = (tool) => {
    const editor = editorRef.current;
    editor?.focus();
    if (tool.command === "createLink") {
      const url = window.prompt("Endereço do link:");
      if (!url) return;
      document.execCommand("createLink", false, url);
    } else {
      document.execCommand(tool.command, false, tool.value || null);
    }
    const next = richTextHTML(editor.innerHTML);
    valueRef.current = next;
    onChange(next);
  };

  return <div className="rich-editor" style={{ "--rich-editor-min-height": minHeight }}>
    <div className="rich-toolbar" role="toolbar" aria-label="Ferramentas de formatação">
      {tools.map((tool, index) => tool.separator
        ? <span className="rich-separator" aria-hidden="true" key={`separator-${index}`} />
        : <button type="button" key={tool.label} title={tool.label} aria-label={tool.label} className={`rich-tool ${tool.className || ""}`} onMouseDown={event => event.preventDefault()} onClick={() => run(tool)}>{tool.icon}</button>)}
    </div>
    <div ref={editorRef} className="rich-content" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" data-placeholder={placeholder}
      onInput={event => { const next = richTextHTML(event.currentTarget.innerHTML); valueRef.current = next; onChange(next); }}
      onPaste={event => { event.preventDefault(); const text = event.clipboardData.getData("text/plain"); document.execCommand("insertText", false, text); }} />
  </div>;
}
