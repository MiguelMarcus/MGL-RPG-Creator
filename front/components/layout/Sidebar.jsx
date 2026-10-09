"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { categories } from "../../../back/odc.mjs";

export default function Sidebar({ active, setActive, entries }) {
  const router = useRouter();
  const selectCategory = category => {
    setActive(category);
    router.push(category === "todos" ? "/" : `/?categoria=${encodeURIComponent(category)}`);
  };

  return <aside className="sidebar">
    <Link href="/" className="brand" onClick={() => setActive("todos")}><span className="brand-mark">O</span><span>ODC<small>OFICINA DE CRIAÇÃO</small></span></Link>
    <button className="new-button" onClick={() => router.push("/criar")}><span aria-hidden="true">＋</span> Nova criação</button>
    <div className="nav-caption">BIBLIOTECA</div>
    <nav aria-label="Categorias da biblioteca">
      <button type="button" className={`nav-item ${active === "todos" ? "selected" : ""}`} aria-current={active === "todos" ? "page" : undefined} onClick={() => selectCategory("todos")}><span className="nav-icon" aria-hidden="true">▦</span><span>Todas as criações</span><span className="nav-count">{entries.length}</span></button>
      {categories.map(category => <button type="button" key={category.id} className={`nav-item ${active === category.id ? "selected" : ""}`} aria-current={active === category.id ? "page" : undefined} onClick={() => selectCategory(category.id)}><span className="nav-icon" aria-hidden="true">{category.icon}</span><span>{category.label}</span><span className="nav-count">{entries.filter(entry => entry.type === category.id).length}</span></button>)}
    </nav>
    <div className="sidebar-bottom"><p className="storage-note">Seus conteúdos ficam salvos neste navegador.</p></div>
  </aside>;
}
