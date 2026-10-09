import { categories } from "../../lib/odc.mjs";

export default function Sidebar({ active, setActive, entries, onNew }) {
  return <aside className="sidebar">
    <a href="#home" className="brand"><span className="brand-mark">OD</span><span>ODC<small>OFICINA DE CRIAÇÃO</small></span></a>
    <button className="new-button" onClick={onNew}><span>＋</span> Nova criação <kbd>N</kbd></button>
    <div className="nav-caption">BIBLIOTECA</div>
    <nav>{categories.map(c => <button key={c.id} className={`nav-item ${active === c.id ? "selected" : ""}`} onClick={() => setActive(c.id)}><span className="nav-icon">{c.icon}</span><span>{c.label}</span><span className="nav-count">{entries.filter(e => e.type === c.id).length}</span></button>)}</nav>
    <div className="sidebar-bottom"><div className="library-note"><span className="note-icon">✧</span><strong>Seu mundo, suas regras.</strong><p>Crie conteúdo único para suas aventuras de Old Dragon 2.</p></div><div className="profile"><div className="avatar">M</div><span>Mestre da mesa<small>Plano gratuito</small></span><span className="dots">•••</span></div></div>
  </aside>;
}
