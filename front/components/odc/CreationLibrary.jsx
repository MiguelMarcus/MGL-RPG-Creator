import { categories } from "../../../back/odc.mjs";

export default function CreationLibrary({ entries, active = "todos", query, onQueryChange, onCreate, onView, onEdit }) {
  const category = categories.find(item => item.id === active);
  const title = category ? category.label : "Todas as criações";
  const visibleEntries = entries.filter(entry => (active === "todos" || entry.type === active) && `${entry.name || ""} ${entry.subtitle || ""}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="all-library-page">
    <header className="all-library-heading"><div><span className="eyebrow">BIBLIOTECA</span><h1>{title}</h1><p>{category ? `Suas criações de ${category.label.toLowerCase()} salvas neste navegador.` : "Monstros, raças, classes, equipamentos e magias salvos neste navegador."}</p></div><button className="save-button" onClick={onCreate}>＋ Nova criação</button></header>
    <div className="all-library-tools"><label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Buscar nas criações" placeholder="Buscar criação" value={query} onChange={event => onQueryChange(event.target.value)} /></label><span>{visibleEntries.length} {visibleEntries.length === 1 ? "item" : "itens"}</span></div>
    {visibleEntries.length ? <div className="creation-grid">{visibleEntries.map(entry => <article className="creation-card" key={entry.id}>
      <div className="creation-art">{entry.image ? <img src={entry.image} alt="" /> : <span>{categories.find(category => category.id === entry.type)?.icon || "✧"}</span>}</div>
      <div className="creation-card-body"><div className="creation-card-meta"><span>{categories.find(category => category.id === entry.type)?.label || "Criação"}</span>{entry.size && <span>{entry.size}</span>}</div><h2>{entry.name || "Sem título"}</h2><p>{entry.subtitle || entry.concept || ""}</p><div className="creation-card-actions"><button className="outline-button" onClick={() => onView(entry)}>Visualizar</button><button className="save-button" onClick={() => onEdit(entry)}>Editar</button></div></div>
    </article>)}</div> : <div className="creation-empty"><span className="creation-empty-icon">▦</span><h2>{query ? "Nenhuma criação encontrada" : category ? `Nenhuma criação de ${category.label.toLowerCase()} ainda` : "Sua biblioteca está vazia"}</h2><p>{query ? "Tente outra busca." : category ? "Crie uma nova ou escolha outra categoria." : "Salve uma criação para ela aparecer aqui."}</p>{!query && <button className="save-button" onClick={onCreate}>＋ Nova criação</button>}</div>}
  </section>;
}
