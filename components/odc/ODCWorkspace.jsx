"use client";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import EntryEditor from "./EntryEditor";
import EntryPreview from "./EntryPreview";
import { blankEntry, categories, toFoundryJSON } from "../../lib/odc.mjs";

export default function ODCWorkspace() {
  const [entries, setEntries] = useState([]);
  const [active, setActive] = useState("todos");
  const [selected, setSelected] = useState("");
  const [entry, setEntry] = useState(() => blankEntry());
  const [mode, setMode] = useState("editor");
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("dark");
  const filtered = useMemo(() => entries.filter(e => (active === "todos" || e.type === active) && String(e.name || "").toLowerCase().includes(query.toLowerCase())), [entries, active, query]);
  const category = categories.find(c => c.id === entry.type);
  const libraryCategory = categories.find(c => c.id === active);

  useEffect(() => { const raw = localStorage.getItem("odc-entries"); if (raw) { try { const list = JSON.parse(raw).filter(item => item.id !== "brugo-bufante"); setEntries(list); if (list.length) { setSelected(list[0].id); setEntry(list[0]); setSaved(true); } } catch {} } }, []);
  useEffect(() => { const stored = localStorage.getItem("odc-theme"); const next = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"); setTheme(next); document.documentElement.dataset.theme = next; }, []);

  const notify = text => { setToast(text); setTimeout(() => setToast(""), 2600); };
  const toggleTheme = () => { const next = theme === "dark" ? "light" : "dark"; setTheme(next); document.documentElement.dataset.theme = next; localStorage.setItem("odc-theme", next); };
  const changeEntry = value => { setEntry(value); setSaved(false); };
  const selectEntry = item => { setSelected(item.id); setEntry(item); if (active !== "todos") setActive(item.type); setMode("editor"); setSaved(true); };
  const save = () => { if (!entry.name.trim()) { notify("Informe um nome antes de salvar."); return; } const list = [...entries.filter(e => e.id !== entry.id), entry]; try { localStorage.setItem("odc-entries", JSON.stringify(list)); } catch { notify("O armazenamento do navegador está cheio. Remova imagens ou reduza o tamanho dos arquivos."); return; } setEntries(list); setSelected(entry.id); setSaved(true); notify("Criação salva na sua biblioteca"); };
  const create = () => { const item = blankEntry(active === "todos" ? entry.type : active); setEntry(item); setSelected(item.id); setMode("editor"); setSaved(false); document.querySelector(".workspace-main")?.scrollTo(0, 0); };
  const setLibrary = id => { setActive(id); setMode("editor"); const next = entries.find(item => id === "todos" || item.type === id); if (next) { setSelected(next.id); setEntry(next); setSaved(true); } else if (id !== "todos") { const fresh = blankEntry(id); setEntry(fresh); setSelected(fresh.id); setSaved(false); } };
  const downloadJSON = () => { const blob = new Blob([JSON.stringify(toFoundryJSON(entry), null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${(entry.name || "criacao").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`; a.click(); URL.revokeObjectURL(url); notify(["racas", "classes", "magias"].includes(entry.type) ? "JSON pronto para o importador" : "JSON exportado no formato ODC"); };
  const exportPDF = () => { setMode("preview"); setTimeout(() => window.print(), 120); };
  return <div className="app-shell">
    <Sidebar active={active} setActive={setLibrary} entries={entries} onNew={create} />
    <main className="workspace-main">
      <header className="topbar"><div className="breadcrumbs"><span>Biblioteca</span><b>›</b><strong>{category?.label || "Monstros"}</strong><b>›</b><span>{entry.name || "Nova criação"}</span></div><div className="top-actions"><span className={`save-state ${saved ? "is-saved" : ""}`}><i />{saved ? "Salvo" : "Não salvo"}</span><button className="theme-toggle" onClick={toggleTheme} aria-label={`Ativar modo ${theme === "dark" ? "claro" : "escuro"}`} title={`Modo ${theme === "dark" ? "claro" : "escuro"}`}><span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span><span className="theme-label">{theme === "dark" ? "Claro" : "Escuro"}</span></button></div></header>
      <div className="page-content"><div className="page-heading"><div><h1>{entry.name || "Nova criação"}</h1><p>Preencha os campos e salve sua criação.</p></div><div className="heading-actions"><button className="outline-button" onClick={() => setMode(mode === "editor" ? "preview" : "editor")}>{mode === "editor" ? "Ver ficha" : "Voltar à edição"}</button><button className="export-button" onClick={e => e.currentTarget.nextSibling.classList.toggle("show")}><span>⇩</span> Exportar <b>⌄</b></button><div className="export-menu"><button onClick={downloadJSON}>Exportar JSON <small>{["racas", "classes", "magias"].includes(entry.type) ? "Compatível com o importador Foundry" : "Dados da criação"}</small></button><button onClick={exportPDF}>Salvar como PDF <small>Ficha pronta para imprimir</small></button></div></div></div>
        <div className="workspace-grid"><section className="editor-panel"><div className="panel-top"><span className="panel-title">{mode === "editor" ? "Editar detalhes" : "Prévia da ficha"}</span></div>{mode === "editor" ? <EntryEditor entry={entry} onChange={changeEntry} /> : <div className="preview-wrap"><EntryPreview entry={entry} /></div>}
          <div className="editor-footer"><span>{saved ? "Todas as alterações salvas" : "Alterações ainda não salvas"}</span><div><button className="text-action" onClick={() => { const original = entries.find(item => item.id === selected); if (original) { setEntry(original); setSaved(true); } else { const fresh = blankEntry(entry.type); setEntry(fresh); setSelected(fresh.id); setSaved(false); } }}>Descartar</button><button className="save-button" onClick={save}>Salvar criação <span>↗</span></button></div></div>
        </section>
        <aside className="library-panel"><div className="library-head"><h3>{active === "todos" ? "Todas as criações" : libraryCategory?.label}</h3><button className="add-small" onClick={create} aria-label="Criar novo item" title="Criar novo item">＋</button></div><div className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Buscar na biblioteca" placeholder="Buscar" value={query} onChange={e => setQuery(e.target.value)} /></div><div className="library-list">{filtered.map(item => <button key={item.id} className={`library-item ${selected === item.id ? "active" : ""}`} onClick={() => selectEntry(item)}><div className="thumb">{item.image ? <img src={item.image} alt="" /> : <span>{categories.find(c => c.id === item.type)?.icon}</span>}</div><span className="entry-info"><strong>{item.name || "Sem título"}</strong><small>{active === "todos" ? `${categories.find(c => c.id === item.type)?.label || "Criação"}${item.concept ? ` · ${item.concept}` : ""}` : item.concept || ""}</small></span></button>)}{filtered.length === 0 && <div className="library-empty"><span>{query ? "Nenhum resultado." : active === "todos" ? "Sua biblioteca está vazia." : "Ainda não há itens nesta categoria."}</span>{!query && active !== "todos" && <button onClick={create}>Criar primeiro item</button>}</div>}</div></aside></div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </main>
  </div>;
}
