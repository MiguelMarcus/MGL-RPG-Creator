"use client";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import EntryEditor from "./EntryEditor";
import EntryPreview from "./EntryPreview";
import { blankEntry, categories, sample, toFoundryJSON } from "../../lib/odc.mjs";

export default function ODCWorkspace() {
  const [entries, setEntries] = useState([sample]);
  const [active, setActive] = useState("monstros");
  const [selected, setSelected] = useState(sample.id);
  const [entry, setEntry] = useState(sample);
  const [mode, setMode] = useState("editor");
  const [saved, setSaved] = useState(true);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("dark");
  const filtered = useMemo(() => entries.filter(e => e.type === active && e.name.toLowerCase().includes(query.toLowerCase())), [entries, active, query]);
  const category = categories.find(c => c.id === active);

  useEffect(() => { const raw = localStorage.getItem("odc-entries"); if (raw) { try { const list = JSON.parse(raw); if (list.length) { setEntries(list); setSelected(list[0].id); setEntry(list[0]); setActive(list[0].type); } } catch {} } }, []);
  useEffect(() => { const stored = localStorage.getItem("odc-theme"); const next = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"); setTheme(next); document.documentElement.dataset.theme = next; }, []);

  const notify = text => { setToast(text); setTimeout(() => setToast(""), 2600); };
  const toggleTheme = () => { const next = theme === "dark" ? "light" : "dark"; setTheme(next); document.documentElement.dataset.theme = next; localStorage.setItem("odc-theme", next); };
  const changeEntry = value => { setEntry(value); setSaved(false); };
  const selectEntry = e => { setSelected(e.id); setEntry(e); setActive(e.type); setMode("editor"); setSaved(true); };
  const save = () => { const list = [...entries.filter(e => e.id !== entry.id), entry]; setEntries(list); localStorage.setItem("odc-entries", JSON.stringify(list)); setSelected(entry.id); setSaved(true); notify("Criação salva na sua biblioteca"); };
  const create = () => { const item = blankEntry(active); setEntry(item); setSelected(item.id); setMode("editor"); setSaved(false); document.querySelector(".workspace-main")?.scrollTo(0, 0); };
  const downloadJSON = () => { const blob = new Blob([JSON.stringify(toFoundryJSON(entry), null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${(entry.name || "criacao").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`; a.click(); URL.revokeObjectURL(url); notify(["racas", "classes", "magias"].includes(entry.type) ? "JSON pronto para o importador" : "JSON exportado no formato ODC"); };
  const exportPDF = () => { setMode("preview"); setTimeout(() => window.print(), 120); };
  return <div className="app-shell">
    <Sidebar active={active} setActive={id => { setActive(id); setMode("editor"); const next = entries.find(e => e.type === id); if (next) selectEntry(next); else { setEntry(blankEntry(id)); setSelected(""); } }} entries={entries} onNew={create} />
    <main className="workspace-main">
      <header className="topbar"><div className="breadcrumbs"><span>Biblioteca</span><b>›</b><strong>{category?.label}</strong><b>›</b><span>{entry.name || "Nova criação"}</span></div><div className="top-actions"><span className={`save-state ${saved ? "is-saved" : ""}`}><i />{saved ? "Salvo" : "Não salvo"}</span><button className="theme-toggle" onClick={toggleTheme} aria-label={`Ativar modo ${theme === "dark" ? "claro" : "escuro"}`} title={`Modo ${theme === "dark" ? "claro" : "escuro"}`}><span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span><span className="theme-label">{theme === "dark" ? "Claro" : "Escuro"}</span></button></div></header>
      <div className="page-content"><div className="page-heading"><div><div className="eyebrow">SUA BIBLIOTECA <span>✧</span> {category?.label.toUpperCase()}</div><h1>{entry.name || `Nova ${category?.label?.slice(0, -1).toLowerCase() || "criação"}`}</h1><p>Uma boa aventura começa com uma boa história.</p></div><div className="heading-actions"><button className="outline-button" onClick={() => { setMode(mode === "editor" ? "preview" : "editor"); }}><span>{mode === "editor" ? "◉" : "✎"}</span>{mode === "editor" ? "Ver ficha" : "Editar criação"}</button><button className="export-button" onClick={e => e.currentTarget.nextSibling.classList.toggle("show")}><span>⇩</span> Exportar <b>⌄</b></button><div className="export-menu"><button onClick={downloadJSON}>⇩ Exportar JSON <small>{["racas", "classes", "magias"].includes(entry.type) ? "Formato do importador Foundry" : "Formato ODC"}</small></button><button onClick={exportPDF}>▤ Salvar como PDF <small>Ficha pronta para imprimir</small></button></div></div></div>
        <div className="workspace-grid"><section className="editor-panel"><div className="panel-top"><div><span className="panel-title">{mode === "editor" ? "EDITOR" : "PRÉ-VISUALIZAÇÃO"}</span><span className="panel-context">{mode === "editor" ? " · Campos da criação" : " · Ficha final"}</span></div><span className="panel-menu">•••</span></div>{mode === "editor" ? <EntryEditor entry={entry} onChange={changeEntry} /> : <div className="preview-wrap"><EntryPreview entry={entry} /></div>}
          <div className="editor-footer"><span>{saved ? "Todas as alterações salvas" : "Alterações ainda não salvas"}</span><div><button className="text-action" onClick={() => { setEntry(sample); setSelected(sample.id); setSaved(true); }}>Descartar</button><button className="save-button" onClick={save}>Salvar criação <span>↗</span></button></div></div>
        </section>
        <aside className="library-panel"><div className="library-head"><div><span className="eyebrow">SEU ACERVO</span><h3>{category?.label}</h3></div><button className="add-small" onClick={create}>＋</button></div><div className="search-box"><span>⌕</span><input placeholder="Buscar na biblioteca" value={query} onChange={e => setQuery(e.target.value)} /></div><div className="library-list">{filtered.map((e, i) => <button key={e.id} className={`library-item ${selected === e.id ? "active" : ""}`} onClick={() => selectEntry(e)}><div className="thumb">{e.image ? <img src={e.image} alt="" /> : <span>{i % 2 ? "✧" : "◈"}</span>}<i /></div><span className="entry-info"><strong>{e.name || "Sem título"}</strong><small>{e.concept || "Rascunho"} · {e.updated || "Rascunho"}</small></span><span className="item-more">•••</span></button>)}</div><button className="browse-all" onClick={() => notify("Você está vendo sua biblioteca completa")}>Ver biblioteca completa <span>→</span></button><div className="tip-card"><span>✧</span><div><strong>Dica de mestre</strong><p>Use imagens com fundo transparente para destacar sua criação na ficha.</p></div></div></aside></div>
      </div>
      {toast && <div className="toast">✧ &nbsp;{toast}</div>}
    </main>
  </div>;
}
