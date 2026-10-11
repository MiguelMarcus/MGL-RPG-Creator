"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { categories, descriptionFontFamily, monsterHitPoints, richTextHTML } from "../../../back/odc.mjs";
import botanicalOrnament from "../../assets/ornamento-botanico-dourado.png";
import cornerOrnament from "../../assets/ornamento-canto-dourado.png";
import friezeOrnament from "../../assets/ornamento-friso-dourado.png";

const textSections = entry => entry.type === "racas"
  ? [["Descrição", entry.description], ["Personalidade", entry.combat], ["Aventuras", entry.finalDescription]]
  : entry.type === "classes"
    ? [["Introdução", entry.description], ["Descrição", entry.combat], ["Restrições", entry.finalDescription]]
    : [["Descrição (Início)", entry.description], ["Descrição (Habilidades de Combate)", entry.combat], ["Descrição (Final)", entry.finalDescription]];

const ornaments = [
  { id: "botanical", image: botanicalOrnament },
  { id: "corner", image: cornerOrnament },
];

function ornamentForEntry(id) {
  const hash = [...String(id || "odc")].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) | 0, 0);
  return ornaments[Math.abs(hash) % ornaments.length];
}

export default function EntryPreview({ entry }) {
  const [imageOpen, setImageOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const imageButtonRef = useRef(null);
  const isMonster = entry.type === "monstros";
  const category = categories.find(item => item.id === entry.type)?.label || "Criação";
  const descriptionFont = descriptionFontFamily(entry.descriptionFont);
  const hitPoints = monsterHitPoints(entry);
  const ornament = ornamentForEntry(entry.id);
  const gameData = entry.type === "racas" ? [["MOVIMENTO", entry.movement && `${entry.movement} m`], ["INFRAVISÃO", entry.infravision && `${entry.infravision} m`], ["ALINHAMENTO", entry.alignment]]
    : entry.type === "classes" ? [["TIPO", entry.classKind === "especializacao" ? "Especialização" : entry.classKind === "classe" ? "Classe base" : ""], ["CLASSE BASE", entry.baseClass], ["PV NO 1º NÍVEL", entry.classHitDie], ["PV APÓS O 10º", entry.highLevelHpBonus], ["ATRIBUTO PRINCIPAL", entry.primeAttribute], ["REQUISITOS", entry.requirements], ["ARMAS", entry.weaponRestrictions], ["ARMADURAS", entry.armorRestrictions], ["ITENS MÁGICOS", entry.magicItemRestrictions]]
      : entry.type === "equipamentos" ? [["TIPO", entry.equipmentType], ["PREÇO", entry.price], ["PESO", entry.weight], ["DANO / PROTEÇÃO", entry.damage], ["PROPRIEDADES", entry.properties]]
        : entry.type === "magias" ? [["CÍRCULO", entry.spellLevel], ["ESCOLA", entry.school], ["ALCANCE", entry.range], ["DURAÇÃO", entry.duration], ["COMPONENTES", entry.components], ["ALVO", entry.target], ["JP", entry.jp]] : [];
  const abilities = entry.abilities || [];
  const levelRows = entry.classLevels?.length ? entry.classLevels : [];
  const movementModes = [["Escavando", entry.movementCave], ["Escalando", entry.movementClimb], ["Nadando", entry.movementSwim], ["Voando", entry.movementFly], ["Outros", entry.movementOther]].filter(([, value]) => value);
  const openDetail = (label, value, description = "Informação registrada nesta ficha.") => setDetailOpen({ label, value, description });

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

  useEffect(() => {
    if (!detailOpen) return undefined;
    const closeOnEscape = event => { if (event.key === "Escape") setDetailOpen(null); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [detailOpen]);

  return <article className="sheet-card">
    <div className="sheet-dossier">
      <aside className="sheet-portrait-panel"><div className="sheet-portrait-label">REGISTRO VISUAL</div>{entry.image ? <button ref={imageButtonRef} type="button" className="sheet-image-open" aria-label={`Ampliar imagem de ${entry.name || "criação"}`} onClick={() => setImageOpen(true)}><img className="sheet-image" src={entry.image} alt={entry.name || "Imagem da criação"} /><span>Ampliar imagem</span></button> : <div className="sheet-image-placeholder"><span>✧</span><small>IMAGEM</small></div>}<div className="sheet-portrait-code">ODC · {String(entry.id || "novo").slice(0, 8).toUpperCase()}</div></aside>
      <header className="sheet-identity"><div className="sheet-file-mark"><span>ARQUIVO DE CAMPANHA</span><b>{category}</b></div><h1>{entry.name || "Nova criação"}<span className="sheet-spark">✧</span></h1>{isMonster && [entry.concept, entry.size, entry.alignment].some(Boolean) && <p className="sheet-classification">{[entry.concept, entry.size, entry.alignment].filter(Boolean).join(" · ")}</p>}{entry.subtitle && <p className="sheet-subtitle">{entry.subtitle}</p>}</header>
      <div className="sheet-record">
        {isMonster ? <><div className="sheet-meta"><button type="button" onClick={() => openDetail("Encontro", entry.encounterQuantity || "—", "Quantidade indicada para um encontro comum.")}><small>ENCONTRO</small><strong>{entry.encounterQuantity || "—"}</strong></button><button type="button" onClick={() => openDetail("Encontro no covil", entry.lairEncounterQuantity || "—", "Quantidade indicada quando a criatura é encontrada em seu covil.")}><small>COVIL</small><strong>{entry.lairEncounterQuantity || "—"}</strong></button><button type="button" onClick={() => openDetail("Tesouro", entry.treasure && entry.treasure !== "—" ? entry.treasure : "—", "Tesouro associado a um encontro comum.")}><small>TESOURO</small><strong>{entry.treasure && entry.treasure !== "—" ? entry.treasure : "—"}</strong></button><button type="button" onClick={() => openDetail("Tesouro do covil", entry.lairTreasure || "—", "Tesouro associado ao covil da criatura.")}><small>TESOURO DO COVIL</small><strong>{entry.lairTreasure || "—"}</strong></button></div>
          <div className="sheet-stats"><button type="button" onClick={() => openDetail("Dados de Vida e Pontos de Vida", `${entry.hd || "—"} [${hitPoints === "" ? "—" : hitPoints}]`)}><small>DV · PV</small><strong>{entry.hd || "—"} <span>[{hitPoints === "" ? "—" : hitPoints}]</span></strong></button><button type="button" onClick={() => openDetail("Classe de Armadura", entry.ac || "—")}><small>CA</small><strong>{entry.ac || "—"}</strong></button><button type="button" onClick={() => openDetail("Jogada de Proteção", entry.jp || "—")}><small>JP</small><strong>{entry.jp || "—"}</strong></button><button type="button" onClick={() => openDetail("Moral", entry.morale || "—")}><small>MO</small><strong>{entry.morale || "—"}</strong></button></div>
          <div className="sheet-extra"><button type="button" onClick={() => openDetail("Experiência", `${entry.xp || "—"} XP`)}><small>EXPERIÊNCIA</small><strong>{entry.xp || "—"} XP</strong></button><button type="button" onClick={() => openDetail("Movimento", `${entry.movement || "—"} m`)}><small>MOVIMENTO</small><strong>{entry.movement || "—"} m</strong></button>{movementModes.map(([label, value]) => <button type="button" key={label} onClick={() => openDetail(label, `${value} m`)}><small>{label.toUpperCase()}</small><strong>{value} m</strong></button>)}</div></> : <div className="sheet-meta game-data">{gameData.filter(([, value]) => value !== "" && value !== undefined && value !== null).map(([label, value]) => <button type="button" key={label} onClick={() => openDetail(label, value)}><small>{label}</small><strong>{value}</strong></button>)}</div>}
      </div>
    </div>
    <div className="sheet-header-ornament" aria-hidden="true"><img src={friezeOrnament.src} alt="" /></div>
    {isMonster && entry.attacks?.length > 0 && <div className="sheet-attacks">{entry.attacks.map((attack, index) => <p key={attack.id || index}><span>◆</span> {attack.count} × <strong>{attack.name} {attack.bonus}</strong> <i>({attack.damage}{attack.extra && ` ${attack.extra}`})</i>{attack.effect && <> · {attack.effect}</>}{attack.weapon && " · Arma"}</p>)}</div>}
    <div className="sheet-body"><div className="sheet-content">
    {entry.type === "classes" && levelRows.length > 0 && <section className="sheet-description"><h2>Progressão de níveis</h2><div className="sheet-progression">{levelRows.map((row, index) => <div key={row.id || index}><strong>{row.level || index + 1}</strong><span>XP {row.xp || "—"}</span><span>PV {row.hp || "—"}</span><span>BA {row.ba || "—"}</span><span>JP {row.jp || "—"}</span></div>)}</div></section>}
    {(entry.type === "racas" || entry.type === "classes") && abilities.filter(ability => ability.name || ability.description).map((ability, index) => <section className="sheet-description" key={ability.id || index}><h2>{ability.name || "Habilidade"}{entry.type === "classes" && ability.level ? ` · Nível ${ability.level}` : ""}</h2>{ability.description && <div className="rich-preview" dangerouslySetInnerHTML={{ __html: richTextHTML(ability.description) }} />}</section>)}
    {entry.type === "classes" && (entry.classSpells || []).filter(spell => spell.name || spell.description).map((spell, index) => <section className="sheet-description" key={spell.id || index}><h2>{spell.name || "Magia"}</h2><p>{[spell.school, spell.spellLevel && `Círculo ${spell.spellLevel}`, spell.range, spell.duration].filter(Boolean).join(" · ")}</p>{spell.description && <div className="rich-preview" dangerouslySetInnerHTML={{ __html: richTextHTML(spell.description) }} />}</section>)}
    {textSections(entry).filter(([, value]) => String(value || "").trim()).map(([title, value]) => <section className="sheet-description rich-preview" style={{ fontFamily: descriptionFont }} key={title}><div className="sheet-section-heading"><h2>{title}</h2><button type="button" className="sheet-read-trigger" onClick={() => openDetail(title, null, richTextHTML(value))}>Ler em foco ↗</button></div><div dangerouslySetInnerHTML={{ __html: richTextHTML(value) }} /></section>)}
    </div><aside className={`sheet-ornament sheet-ornament--${ornament.id}`} aria-hidden="true"><img src={ornament.image.src} alt="" /></aside></div>
    <div className="sheet-foot"><span>ODC <i>✧</i> OFICINA DE CRIAÇÃO</span><span>OLD DRAGON 2ª EDIÇÃO</span></div>
    {detailOpen && createPortal(<div className="sheet-detail-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setDetailOpen(null); }}><section className="sheet-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="sheet-detail-title"><button className="sheet-detail-close" type="button" aria-label="Fechar leitura" onClick={() => setDetailOpen(null)}>×</button><span className="sheet-detail-kicker">CONSULTA DA FICHA</span><h2 id="sheet-detail-title">{detailOpen.label}</h2>{detailOpen.value && <strong className="sheet-detail-value">{detailOpen.value}</strong>}<div className="sheet-detail-content" dangerouslySetInnerHTML={{ __html: detailOpen.value ? `<p>${detailOpen.description}</p>` : detailOpen.description }} /><small>Pressione Esc ou clique fora para fechar.</small></section></div>, document.body)}
    {imageOpen && createPortal(<div className="image-viewer-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setImageOpen(false); }}><div className="image-viewer-dialog" role="dialog" aria-modal="true" aria-label={`Imagem de ${entry.name || "criação"}`}><button className="image-viewer-close" type="button" aria-label="Fechar imagem" onClick={() => setImageOpen(false)}>×</button><img src={entry.image} alt={entry.name || "Imagem da criação"} /><p>{entry.name || "Imagem da criação"} <span>· Esc para fechar</span></p></div></div>, document.body)}
  </article>;
}
