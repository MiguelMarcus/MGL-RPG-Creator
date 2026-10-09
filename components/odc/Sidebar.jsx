import { categories } from "../../lib/odc.mjs";

export default function Sidebar({ active, setActive, entries, onNew }) {
  return <aside className="sidebar">
    <a href="#home" className="brand"><span className="brand-mark">O</span><span>ODC<small>OFICINA DE CRIAÇÃO</small></span></a>
    <button className="new-button" onClick={onNew}><span>＋</span> Nova criação</button>
    <div className="nav-caption">BIBLIOTECA</div>
    <nav><button className={`nav-item ${active === "todos" ? "selected" : ""}`} onClick={() => setActive("todos")}><span className="nav-icon">▦</span><span>Todas as criações</span><span className="nav-count">{entries.length}</span></button>{categories.map(c => <button key={c.id} className={`nav-item ${active === c.id ? "selected" : ""}`} onClick={() => setActive(c.id)}><span className="nav-icon">{c.icon}</span><span>{c.label}</span><span className="nav-count">{entries.filter(e => e.type === c.id).length}</span></button>)}</nav>
    <div className="sidebar-bottom"><p className="storage-note">Seus conteúdos ficam salvos neste navegador.</p></div>
  </aside>;
}
