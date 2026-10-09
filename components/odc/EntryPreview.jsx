import { richTextHTML } from "../../lib/odc.mjs";

export default function EntryPreview({ entry }) {
  const gameData = entry.type === "racas" ? [["TRAÇOS", entry.raceTraits], ["HABILIDADES", entry.raceAbilities], ["IDIOMAS", entry.languages]]
    : entry.type === "classes" ? [["DADO DE VIDA", entry.classHitDie], ["ATRIBUTO PRINCIPAL", entry.primeAttribute], ["REQUISITOS", entry.requirements], ["PROGRESSÃO", entry.progression]]
    : entry.type === "equipamentos" ? [["TIPO", entry.equipmentType], ["PREÇO", entry.price], ["PESO", entry.weight], ["DANO / PROTEÇÃO", entry.damage], ["PROPRIEDADES", entry.properties]]
    : entry.type === "magias" ? [["CÍRCULO", entry.spellLevel], ["ESCOLA", entry.school], ["ALCANCE", entry.range], ["DURAÇÃO", entry.duration], ["COMPONENTES", entry.components], ["ALVO", entry.target]] : null;
  const isMonster = entry.type === "monstros";
  return <article className="sheet-card">
    <div className="sheet-top"><div className="sheet-copy"><div className="sheet-kicker">{[entry.concept, entry.size, entry.alignment].filter(Boolean).join(" · ")}</div><h1>{entry.name || "Nova criação"}<span className="sheet-spark">✧</span></h1>{entry.subtitle && <p className="sheet-subtitle">{entry.subtitle}</p>}</div>{entry.image ? <img className="sheet-image" src={entry.image} alt="" /> : <div className="sheet-image-placeholder"><span>✧</span><small>IMAGEM</small></div>}</div>
    {isMonster ? <><div className="sheet-meta"><div><small>ENCONTRO</small><strong>{entry.encounterQuantity || "—"}</strong></div><div><small>ENCONTRO (COVIL)</small><strong>{entry.lairEncounterQuantity || "—"}</strong></div><div><small>TESOURO</small><strong>{entry.treasure && entry.treasure !== "—" ? entry.treasure : "—"}</strong></div><div><small>TESOURO (COVIL)</small><strong>{entry.lairTreasure || "—"}</strong></div></div>
    <div className="sheet-stats"><div><small>DV [PV]</small><strong>{entry.hd || "—"} <span>[{entry.hp || "—"}]</span></strong></div><div><small>CA</small><strong>{entry.ac || "—"}</strong></div><div><small>JP</small><strong>{entry.jp || "—"}</strong></div><div><small>MO</small><strong>{entry.morale || "—"}</strong></div></div>
    <div className="sheet-extra"><span><small>EXPERIÊNCIA</small><strong>{entry.xp || "—"} XP</strong></span><span><small>MOVIMENTO</small><strong>{entry.movement || "—"}</strong></span></div>
    {entry.attacks?.length > 0 && <div className="sheet-attacks">{entry.attacks.map((a, i) => <p key={i}><span>◆</span> {a.count} × <strong>{a.name || "Ataque"} {a.bonus}</strong> <i>({a.damage}{a.extra && ` ${a.extra}`})</i></p>)}</div>}</> : <div className="sheet-meta game-data">{(gameData || []).filter(([, value]) => value).map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}{entry.xp > 0 && <div><small>EXPERIÊNCIA</small><strong>{entry.xp} XP</strong></div>}</div>}
    {[["Descrição (Início)", entry.description], ["Descrição (Habilidades de Combate)", entry.combat], ["Descrição (Final)", entry.finalDescription]].filter(([, value]) => String(value || "").trim()).map(([title, value]) => <section className="sheet-description rich-preview" key={title}><h2>{title}</h2><div dangerouslySetInnerHTML={{ __html: richTextHTML(value) }} /></section>)}
    <div className="sheet-foot"><span>ODC <i>✧</i> OFICINA DE CRIAÇÃO</span><span>OLD DRAGON 2ª EDIÇÃO</span></div>
  </article>;
}
