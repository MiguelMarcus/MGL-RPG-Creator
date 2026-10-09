"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { categories, descriptionFontFamily, richTextHTML } from "../../lib/odc.mjs";

const textSections = entry => entry.type === "racas"
  ? [["Descrição", entry.description], ["Personalidade", entry.combat], ["Aventuras", entry.finalDescription]]
  : entry.type === "classes"
    ? [["Introdução", entry.description], ["Descrição", entry.combat], ["Restrições", entry.finalDescription]]
    : [["Descrição (Início)", entry.description], ["Descrição (Habilidades de Combate)", entry.combat], ["Descrição (Final)", entry.finalDescription]];

export default function EntryPreview({ entry }) {
  const [imageOpen, setImageOpen] = useState(false);
  const imageButtonRef = useRef(null);
  const isMonster = entry.type === "monstros";
  const category = categories.find(item => item.id === entry.type)?.label || "Criação";
  const descriptionFont = descriptionFontFamily(entry.descriptionFont);
  const gameData = entry.type === "racas" ? [["MOVIMENTO", entry.movement && `${entry.movement} m`], ["INFRAVISÃO", entry.infravision && `${entry.infravision} m`], ["ALINHAMENTO", entry.alignment]]
    : entry.type === "classes" ? [["TIPO", entry.classKind === "especializacao" ? "Especialização" : entry.classKind === "classe" ? "Classe base" : ""], ["CLASSE BASE", entry.baseClass], ["PV NO 1º NÍVEL", entry.classHitDie], ["PV APÓS O 10º", entry.highLevelHpBonus], ["ATRIBUTO PRINCIPAL", entry.primeAttribute], ["REQUISITOS", entry.requirements], ["ARMAS", entry.weaponRestrictions], ["ARMADURAS", entry.armorRestrictions], ["ITENS MÁGICOS", entry.magicItemRestrictions]]
      : entry.type === "equipamentos" ? [["TIPO", entry.equipmentType], ["PREÇO", entry.price], ["PESO", entry.weight], ["DANO / PROTEÇÃO", entry.damage], ["PROPRIEDADES", entry.properties]]
        : entry.type === "magias" ? [["CÍRCULO", entry.spellLevel], ["ESCOLA", entry.school], ["ALCANCE", entry.range], ["DURAÇÃO", entry.duration], ["COMPONENTES", entry.components], ["ALVO", entry.target], ["JP", entry.jp]] : [];
  const abilities = entry.abilities || [];
  const levelRows = entry.classLevels?.length ? entry.classLevels : [];
  const movementModes = [["Escavando", entry.movementCave], ["Escalando", entry.movementClimb], ["Nadando", entry.movementSwim], ["Voando", entry.movementFly], ["Outros", entry.movementOther]].filter(([, value]) => value);

  useEffect(() => {
    if (!imageOpen) return undefined;
    const closeOnEscape = event => { if (event.key === "Escape") setImageOpen(false); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      imageButtonRef.current?.focus();
    };
  }, [imageOpen]);

  return <article className="sheet-card">
    <div className="sheet-top"><div className="sheet-copy"><div className="sheet-kicker">{category}{isMonster && [entry.concept, entry.size, entry.alignment].some(Boolean) && ` · ${[entry.concept, entry.size, entry.alignment].filter(Boolean).join(" · ")}`}</div><h1>{entry.name || "Nova criação"}<span className="sheet-spark">✧</span></h1>{entry.subtitle && <p className="sheet-subtitle">{entry.subtitle}</p>}</div>{entry.image ? <button ref={imageButtonRef} type="button" className="sheet-image-open" aria-label={`Ampliar imagem de ${entry.name || "criação"}`} onClick={() => setImageOpen(true)}><img className="sheet-image" src={entry.image} alt={entry.name || "Imagem da criação"} /><span>Ampliar imagem</span></button> : <div className="sheet-image-placeholder"><span>✧</span><small>IMAGEM</small></div>}</div>
    {isMonster ? <><div className="sheet-meta"><div><small>ENCONTRO</small><strong>{entry.encounterQuantity || "—"}</strong></div><div><small>ENCONTRO (COVIL)</small><strong>{entry.lairEncounterQuantity || "—"}</strong></div><div><small>TESOURO</small><strong>{entry.treasure && entry.treasure !== "—" ? entry.treasure : "—"}</strong></div><div><small>TESOURO (COVIL)</small><strong>{entry.lairTreasure || "—"}</strong></div></div>
      <div className="sheet-stats"><div><small>DV [PV]</small><strong>{entry.hd || "—"} <span>[{entry.hp || "—"}]</span></strong></div><div><small>CA</small><strong>{entry.ac || "—"}</strong></div><div><small>JP</small><strong>{entry.jp || "—"}</strong></div><div><small>MO</small><strong>{entry.morale || "—"}</strong></div></div>
      <div className="sheet-extra"><span><small>EXPERIÊNCIA</small><strong>{entry.xp || "—"} XP</strong></span><span><small>MOVIMENTO</small><strong>{entry.movement || "—"} m</strong></span>{movementModes.map(([label, value]) => <span key={label}><small>{label.toUpperCase()}</small><strong>{value} m</strong></span>)}</div>
      {entry.attacks?.length > 0 && <div className="sheet-attacks">{entry.attacks.map((attack, index) => <p key={attack.id || index}><span>◆</span> {attack.count} × <strong>{attack.name} {attack.bonus}</strong> <i>({attack.damage}{attack.extra && ` ${attack.extra}`})</i>{attack.effect && <> · {attack.effect}</>}{attack.weapon && " · Arma"}</p>)}</div>}
    </> : <div className="sheet-meta game-data">{gameData.filter(([, value]) => value !== "" && value !== undefined && value !== null).map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>}
    {entry.type === "classes" && levelRows.length > 0 && <section className="sheet-description"><h2>Progressão de níveis</h2><div className="sheet-progression">{levelRows.map((row, index) => <div key={row.id || index}><strong>{row.level || index + 1}</strong><span>XP {row.xp || "—"}</span><span>PV {row.hp || "—"}</span><span>BA {row.ba || "—"}</span><span>JP {row.jp || "—"}</span></div>)}</div></section>}
    {(entry.type === "racas" || entry.type === "classes") && abilities.filter(ability => ability.name || ability.description).map((ability, index) => <section className="sheet-description" key={ability.id || index}><h2>{ability.name || "Habilidade"}{entry.type === "classes" && ability.level ? ` · Nível ${ability.level}` : ""}</h2>{ability.description && <div className="rich-preview" dangerouslySetInnerHTML={{ __html: richTextHTML(ability.description) }} />}</section>)}
    {entry.type === "classes" && (entry.classSpells || []).filter(spell => spell.name || spell.description).map((spell, index) => <section className="sheet-description" key={spell.id || index}><h2>{spell.name || "Magia"}</h2><p>{[spell.school, spell.spellLevel && `Círculo ${spell.spellLevel}`, spell.range, spell.duration].filter(Boolean).join(" · ")}</p>{spell.description && <div className="rich-preview" dangerouslySetInnerHTML={{ __html: richTextHTML(spell.description) }} />}</section>)}
    {textSections(entry).filter(([, value]) => String(value || "").trim()).map(([title, value]) => <section className="sheet-description rich-preview" style={{ fontFamily: descriptionFont }} key={title}><h2>{title}</h2><div dangerouslySetInnerHTML={{ __html: richTextHTML(value) }} /></section>)}
    <div className="sheet-foot"><span>ODC <i>✧</i> OFICINA DE CRIAÇÃO</span><span>OLD DRAGON 2ª EDIÇÃO</span></div>
    {imageOpen && createPortal(<div className="image-viewer-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setImageOpen(false); }}><div className="image-viewer-dialog" role="dialog" aria-modal="true" aria-label={`Imagem de ${entry.name || "criação"}`}><button className="image-viewer-close" type="button" aria-label="Fechar imagem" onClick={() => setImageOpen(false)}>×</button><img src={entry.image} alt={entry.name || "Imagem da criação"} /><p>{entry.name || "Imagem da criação"} <span>· Esc para fechar</span></p></div></div>, document.body)}
  </article>;
}
