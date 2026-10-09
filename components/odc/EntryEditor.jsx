import Field from "./Field";
import RichTextEditor from "./RichTextEditor";
import ImageAssetsEditor from "./ImageAssetsEditor";
import { descriptionFontFamily } from "../../lib/odc.mjs";

const habitats = ["Planícies", "Colinas", "Montanhas", "Pântanos", "Geleiras", "Desertos", "Florestas", "Subterrâneos", "Oceanos", "Extraplanar"];
const baseClasses = ["Guerreiro", "Clérigo", "Ladrão", "Mago"];
const blankAbility = (classAbility = false) => ({ id: globalThis.crypto?.randomUUID?.() || `ability-${Date.now()}`, name: "", description: "", ...(classAbility ? { level: "" } : {}) });
const blankSpell = () => ({ id: globalThis.crypto?.randomUUID?.() || `spell-${Date.now()}`, name: "", description: "", school: "", spellLevel: "", range: "", duration: "", jp: "", reverse: false });
const splitProgression = value => String(value || "").split(",").map(part => part.trim());

export default function EntryEditor({ entry, onChange }) {
  const update = (key, value) => onChange({ ...entry, [key]: value });
  const attackUpdate = (index, key, value) => update("attacks", entry.attacks.map((attack, current) => current === index ? { ...attack, [key]: value } : attack));
  const listUpdate = (key, index, field, value) => update(key, (entry[key] || []).map((item, current) => current === index ? { ...item, [field]: value } : item));
  const isMonster = entry.type === "monstros";
  const isRace = entry.type === "racas";
  const isClass = entry.type === "classes";
  const isGear = entry.type === "equipamentos";
  const isSpell = entry.type === "magias";

  const legacyLevels = (() => {
    const ba = splitProgression(entry.baProgression);
    const jp = splitProgression(entry.jpProgression);
    const xp = splitProgression(entry.xpProgression);
    return Array.from({ length: Math.max(ba.length, jp.length, xp.length) }, (_, index) => ({
      level: String(index + 1), xp: xp[index] || "", hp: "", ba: ba[index] || "", jp: jp[index] || "",
    }));
  })();
  const classLevels = entry.classLevels?.length ? entry.classLevels : legacyLevels;
  const levelProgression = (rows, field) => rows.map(row => row[field] || "").join(",");
  const updateLevels = rows => onChange({ ...entry, classLevels: rows,
    baProgression: levelProgression(rows, "ba"), jpProgression: levelProgression(rows, "jp"), xpProgression: levelProgression(rows, "xp") });
  const calculatedHp = /^\d+(?:[.,]\d+)?$/.test(String(entry.hd || "").trim())
    ? Math.max(0, Number(String(entry.hd).replace(",", ".")) * 5 + (Number(entry.hpBonus) || 0)) : null;

  const descriptionSections = isRace
    ? [["Descrição", "Apresente o mote da raça, suas características e relação com o cenário.", "description"], ["Personalidade", "Descreva valores, costumes e como eles influenciam um personagem.", "combat"], ["Aventuras", "Conte como membros desta raça se tornam aventureiros e inclua perguntas de interpretação.", "finalDescription"]]
    : isClass
      ? [["Introdução", "Apresente em poucas palavras o conceito da classe.", "description"], ["Descrição", "Explique o que diferencia esta classe ou especialização.", "combat"], ["Restrições", "Detalhe limitações e habilidades preservadas da classe base.", "finalDescription"]]
      : [["Descrição (Início)", "Aparência, origem, comportamento e cultura.", "description"], ["Descrição (Habilidades de Combate)", "Táticas, habilidades e comportamento durante um confronto.", "combat"], ["Descrição (Final)", "Detalhes adicionais, curiosidades ou informações para fechar a descrição.", "finalDescription"]];

  return <div className="editor-scroll">
    <section className="editor-section basic-section">
      <div className="section-heading"><div><span className="eyebrow">01 / IDENTIDADE</span><h2>Informações básicas</h2><p>Nome, apresentação e imagem.</p></div><span className="section-symbol">✳</span></div>
      <div className="form-grid basic-grid">
        <Field label="Nome"><input autoFocus value={entry.name} onChange={event => update("name", event.target.value)} /></Field>
        {(isRace || isClass || isSpell) && <Field label="ID para importação" help="Use o mesmo ID para atualizar este item no Foundry."><input value={entry.importId || entry.id} onChange={event => update("importId", event.target.value)} /></Field>}
        <Field label={isRace || isClass ? "Frase de apresentação" : "Subtítulo"} className="span-two"><input value={entry.subtitle} onChange={event => update("subtitle", event.target.value)} /></Field>
        <div className="span-three"><ImageAssetsEditor entry={entry} onChange={onChange} isMonster={isMonster} /></div>
      </div>
    </section>

    {isMonster && <section className="editor-section">
      <div className="section-heading"><div><span className="eyebrow">02 / CLASSIFICAÇÃO</span><h2>Classificação</h2><p>Dados gerais da criatura.</p></div><span className="section-symbol">◈</span></div>
      <div className="form-grid four-grid">
        <Field label="Conceito"><select value={entry.concept} onChange={event => update("concept", event.target.value)}><option value=""></option>{["Animal", "Humanoide", "Construto", "Dragão", "Morto-vivo", "Monstro", "Planta", "Espírito"].map(value => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Tamanho"><select value={entry.size} onChange={event => update("size", event.target.value)}><option value=""></option>{["Miúdo", "Pequeno", "Médio", "Grande", "Enorme", "Gigante"].map(value => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Alinhamento"><select value={entry.alignment} onChange={event => update("alignment", event.target.value)}><option value=""></option>{["Ordeiro", "Neutro", "Caótico"].map(value => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Experiência (XP)" help="Valor concedido ao ser derrotada."><input type="number" min="0" value={entry.xp} onChange={event => update("xp", event.target.value)} /></Field>
      </div>
      <div className="habitat-block"><div className="field-label">Habitats</div><span className="field-help">Selecione os locais onde a criatura pode ser encontrada.</span><div className="chips">{habitats.map(habitat => <label key={habitat} className={`check-chip ${(entry.habitats || []).includes(habitat) ? "checked" : ""}`}><input type="checkbox" checked={(entry.habitats || []).includes(habitat)} onChange={event => update("habitats", event.target.checked ? [...(entry.habitats || []), habitat] : entry.habitats.filter(value => value !== habitat))} /><span>{habitat}</span></label>)}</div></div>
    </section>}

    {isRace && <section className="editor-section">
      <div className="section-heading"><div><span className="eyebrow">02 / DADOS RACIAIS</span><h2>Características da raça</h2><p>Deslocamento, visão e tendência de alinhamento.</p></div><span className="section-symbol">♙</span></div>
      <div className="form-grid three-grid">
        <Field label="Movimento base (m)" help="O padrão racial é definido pelo porte."><input type="number" min="0" step="3" value={entry.movement || ""} onChange={event => update("movement", event.target.value)} /></Field>
        <Field label="Infravisão (m)" help="Deixe vazio se a raça não possuir infravisão."><input type="number" min="0" step="3" value={entry.infravision || ""} onChange={event => update("infravision", event.target.value)} /></Field>
        <Field label="Alinhamento mais comum"><select value={entry.alignment} onChange={event => update("alignment", event.target.value)}><option value=""></option>{["Ordeiro", "Neutro", "Caótico"].map(value => <option key={value}>{value}</option>)}</select></Field>
      </div>
      <div className="race-guidance">Organize a raça em descrição, personalidade, aventuras e habilidades. A referência de criação recomenda quatro habilidades raciais equilibradas.</div>
      <div className="nested-list"><div className="nested-heading"><div><strong>Habilidades raciais</strong><small>Nome e efeito de cada habilidade.</small></div><button type="button" className="outline-button" onClick={() => update("abilities", [...(entry.abilities || []), blankAbility()])}>＋ Adicionar habilidade</button></div>
        {(entry.abilities || []).map((ability, index) => <div className="ability-card" key={ability.id || index}><div className="ability-top"><strong>Habilidade racial</strong><button type="button" className="remove-attack" aria-label="Remover habilidade" onClick={() => update("abilities", entry.abilities.filter((_, current) => current !== index))}>×</button></div><div className="ability-fields"><Field label="Nome"><input value={ability.name || ""} onChange={event => listUpdate("abilities", index, "name", event.target.value)} /></Field><Field label="Descrição"><textarea rows={3} value={ability.description || ""} onChange={event => listUpdate("abilities", index, "description", event.target.value)} /></Field></div></div>)}
      </div>
    </section>}

    {isClass && <section className="editor-section">
      <div className="section-heading"><div><span className="eyebrow">02 / ESTRUTURA DA CLASSE</span><h2>Classe ou especialização</h2><p>Especializações partem de uma das classes base do sistema.</p></div><span className="section-symbol">⚔</span></div>
      <div className="form-grid three-grid">
        <Field label="Tipo"><select value={entry.classKind || ""} onChange={event => update("classKind", event.target.value)}><option value=""></option><option value="classe">Classe base</option><option value="especializacao">Especialização</option></select></Field>
        {entry.classKind === "especializacao" && <Field label="Classe base"><select value={entry.baseClass || ""} onChange={event => update("baseClass", event.target.value)}><option value=""></option>{baseClasses.map(name => <option key={name}>{name}</option>)}</select></Field>}
        <Field label="PV no 1º nível"><input type="number" min="0" value={entry.classHitDie || ""} onChange={event => update("classHitDie", event.target.value)} /></Field>
        <Field label="PV bônus após o 10º nível"><input value={entry.highLevelHpBonus || ""} onChange={event => update("highLevelHpBonus", event.target.value)} /></Field>
        <Field label="Atributo principal"><input value={entry.primeAttribute || ""} onChange={event => update("primeAttribute", event.target.value)} /></Field>
      </div>
      <div className="form-grid three-grid class-restrictions">
        <Field label="Alinhamentos permitidos"><input value={entry.alignmentRestrictions || ""} onChange={event => update("alignmentRestrictions", event.target.value)} /></Field>
        <Field label="Raças permitidas"><input value={entry.raceRestrictions || ""} onChange={event => update("raceRestrictions", event.target.value)} /></Field>
        <Field label="Requisitos"><input value={entry.requirements || ""} onChange={event => update("requirements", event.target.value)} /></Field>
        <Field label="Armas"><textarea rows={2} value={entry.weaponRestrictions || ""} onChange={event => update("weaponRestrictions", event.target.value)} /></Field>
        <Field label="Armaduras"><textarea rows={2} value={entry.armorRestrictions || ""} onChange={event => update("armorRestrictions", event.target.value)} /></Field>
        <Field label="Itens mágicos"><textarea rows={2} value={entry.magicItemRestrictions || ""} onChange={event => update("magicItemRestrictions", event.target.value)} /></Field>
      </div>
      <div className="nested-list progression-list"><div className="nested-heading"><div><strong>Progressão de níveis</strong><small>Registre XP, pontos de vida, Base de Ataque e Jogada de Proteção por nível.</small></div><button type="button" className="outline-button" onClick={() => updateLevels([...classLevels, { level: "", xp: "", hp: "", ba: "", jp: "" }])}>＋ Adicionar nível</button></div>
        {classLevels.length > 0 && <div className="progression-table-wrap"><table className="progression-table"><thead><tr><th>Nível</th><th>XP</th><th>PV</th><th>BA</th><th>JP</th><th aria-label="Remover nível"></th></tr></thead><tbody>{classLevels.map((row, index) => <tr key={row.id || index}>{["level", "xp", "hp", "ba", "jp"].map((key, fieldIndex) => <td key={key}><input aria-label={`${["Nível", "XP", "PV", "BA", "JP"][fieldIndex]}${index + 1}`} value={row[key] || ""} onChange={event => updateLevels(classLevels.map((item, current) => current === index ? { ...item, [key]: event.target.value } : item))} /></td>)}<td><button type="button" className="remove-attack" aria-label="Remover nível" onClick={() => updateLevels(classLevels.filter((_, current) => current !== index))}>×</button></td></tr>)}</tbody></table></div>}
      </div>
      <div className="nested-list"><div className="nested-heading"><div><strong>Habilidades de classe</strong><small>Associe cada habilidade ao nível em que é recebida.</small></div><button type="button" className="outline-button" onClick={() => update("abilities", [...(entry.abilities || []), blankAbility(true)])}>＋ Adicionar habilidade</button></div>
        {(entry.abilities || []).map((ability, index) => <div className="ability-card" key={ability.id || index}><div className="ability-top"><strong>Habilidade de classe</strong><button type="button" className="remove-attack" aria-label="Remover habilidade" onClick={() => update("abilities", entry.abilities.filter((_, current) => current !== index))}>×</button></div><div className="ability-fields"><Field label="Nível"><input type="number" min="1" value={ability.level || ""} onChange={event => listUpdate("abilities", index, "level", event.target.value)} /></Field><Field label="Nome"><input value={ability.name || ""} onChange={event => listUpdate("abilities", index, "name", event.target.value)} /></Field><Field label="Descrição"><textarea rows={3} value={ability.description || ""} onChange={event => listUpdate("abilities", index, "description", event.target.value)} /></Field></div></div>)}
      </div>
      <div className="nested-list"><div className="nested-heading"><div><strong>Magias da classe</strong><small>Inclua as magias que acompanham esta classe ou especialização.</small></div><button type="button" className="outline-button" onClick={() => update("classSpells", [...(entry.classSpells || []), blankSpell()])}>＋ Adicionar magia</button></div>
        {(entry.classSpells || []).map((spell, index) => <div className="ability-card" key={spell.id || index}><div className="ability-top"><strong>Magia</strong><button type="button" className="remove-attack" aria-label="Remover magia" onClick={() => update("classSpells", entry.classSpells.filter((_, current) => current !== index))}>×</button></div><div className="form-grid three-grid"><Field label="Nome"><input value={spell.name || ""} onChange={event => listUpdate("classSpells", index, "name", event.target.value)} /></Field><Field label="Círculo"><input value={spell.spellLevel || ""} onChange={event => listUpdate("classSpells", index, "spellLevel", event.target.value)} /></Field><Field label="Escola"><select value={spell.school || ""} onChange={event => listUpdate("classSpells", index, "school", event.target.value)}><option value=""></option>{[["arcane", "Arcana"], ["divine", "Divina"], ["necromancer", "Necromante"], ["illusionist", "Ilusionista"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Alcance"><input value={spell.range || ""} onChange={event => listUpdate("classSpells", index, "range", event.target.value)} /></Field><Field label="Duração"><input value={spell.duration || ""} onChange={event => listUpdate("classSpells", index, "duration", event.target.value)} /></Field><Field label="Jogada de proteção"><input value={spell.jp || ""} onChange={event => listUpdate("classSpells", index, "jp", event.target.value)} /></Field><Field label="Descrição" className="span-three"><textarea rows={3} value={spell.description || ""} onChange={event => listUpdate("classSpells", index, "description", event.target.value)} /></Field></div></div>)}
      </div>
    </section>}

    {(isGear || isSpell) && <section className="editor-section"><div className="section-heading"><div><span className="eyebrow">02 / DADOS DE JOGO</span><h2>{isGear ? "Equipamento" : "Magia"}</h2><p>Campos específicos do item.</p></div><span className="section-symbol">✧</span></div>
      <div className="form-grid three-grid">
        {isGear && <><Field label="Tipo"><input value={entry.equipmentType || ""} onChange={event => update("equipmentType", event.target.value)} /></Field><Field label="Preço"><input value={entry.price || ""} onChange={event => update("price", event.target.value)} /></Field><Field label="Peso"><input value={entry.weight || ""} onChange={event => update("weight", event.target.value)} /></Field><Field label="Dano ou proteção"><input value={entry.damage || ""} onChange={event => update("damage", event.target.value)} /></Field><Field label="Propriedades"><input value={entry.properties || ""} onChange={event => update("properties", event.target.value)} /></Field></>}
        {isSpell && <><Field label="Círculo"><input value={entry.spellLevel || ""} onChange={event => update("spellLevel", event.target.value)} /></Field><Field label="Escola"><select value={entry.school || ""} onChange={event => update("school", event.target.value)}><option value=""></option>{[["arcane", "Arcana"], ["divine", "Divina"], ["necromancer", "Necromante"], ["illusionist", "Ilusionista"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Alcance"><input value={entry.range || ""} onChange={event => update("range", event.target.value)} /></Field><Field label="Duração"><input value={entry.duration || ""} onChange={event => update("duration", event.target.value)} /></Field><Field label="Jogada de proteção"><input value={entry.jp || ""} onChange={event => update("jp", event.target.value)} /></Field><Field label="Magia reversível"><select value={entry.reverse ? "sim" : "nao"} onChange={event => update("reverse", event.target.value === "sim")}><option value="nao">Não</option><option value="sim">Sim</option></select></Field></>}
      </div>
    </section>}

    {isMonster && <>
      <section className="editor-section"><div className="section-heading"><div><span className="eyebrow">03 / COMBATE</span><h2>Atributos de combate</h2><p>Valores usados na ficha da criatura.</p></div><span className="section-symbol">⚔</span></div>
        <div className="form-grid three-grid">
          <Field label="Dados de Vida (DV)"><input value={entry.hd || ""} onChange={event => update("hd", event.target.value)} /></Field>
          <Field label="Bônus nos Dados de Vida"><input value={entry.hpBonus || ""} onChange={event => update("hpBonus", event.target.value)} /></Field>
          <Field label="Pontos de Vida (PV)" help={calculatedHp !== null ? "Calculado automaticamente: DV × 5 + bônus." : "Informe o valor quando o DV não for numérico."}><input value={calculatedHp ?? entry.hp ?? ""} readOnly={calculatedHp !== null} onChange={event => update("hp", event.target.value)} /></Field>
          <Field label="Classe de Armadura (CA)"><input value={entry.ac || ""} onChange={event => update("ac", event.target.value)} /></Field>
          <Field label="Jogada de Proteção (JP)"><input value={entry.jp || ""} onChange={event => update("jp", event.target.value)} /></Field>
          <Field label="Moral (MO)"><input value={entry.morale || ""} onChange={event => update("morale", event.target.value)} /></Field>
        </div>
        <div className="form-grid six-grid movement-grid">{[["Movimento", "movement"], ["Escavando", "movementCave"], ["Escalando", "movementClimb"], ["Nadando", "movementSwim"], ["Voando", "movementFly"], ["Outros", "movementOther"]].map(([label, key]) => <Field key={key} label={label}><input value={entry[key] || ""} onChange={event => update(key, event.target.value)} /></Field>)}</div>
      </section>
      <section className="editor-section"><div className="section-heading"><div><span className="eyebrow">04 / ENCONTROS</span><h2>Encontros &amp; Tesouro</h2><p>Encontros errantes, covil e tesouros associados.</p></div><span className="section-symbol">◈</span></div>
        <div className="encounter-tip"><p><strong>ⓘ Dica:</strong> o campo Covil registra encontros e tesouros guardados quando a criatura possui um covil. Tesouros usam os códigos da Tabela de Tesouros do LB1.</p><small>Os códigos A–O indicam tesouros de covil e P–V indicam tesouros carregados. Use “+” para combinar tipos e descreva tesouros especiais na narrativa.</small></div>
        <div className="form-grid two-grid encounter-grid">
          <Field label="Quantidade de Encontro"><input value={entry.encounterQuantity || ""} onChange={event => update("encounterQuantity", event.target.value)} /></Field>
          <Field label="Quantidade de Encontro (Covil)"><input value={entry.lairEncounterQuantity || ""} onChange={event => update("lairEncounterQuantity", event.target.value)} /></Field>
          <Field label="Tesouro"><input value={entry.treasure === "—" ? "" : entry.treasure || ""} onChange={event => update("treasure", event.target.value)} /></Field>
          <Field label="Tesouro (Covil)"><input value={entry.lairTreasure || ""} onChange={event => update("lairTreasure", event.target.value)} /></Field>
        </div>
      </section>
      <section className="editor-section"><div className="section-heading"><div><span className="eyebrow">05 / ATAQUES</span><h2>Ataques</h2><p>Registre uma forma de ataque por linha.</p></div><button type="button" className="outline-button" onClick={() => update("attacks", [...(entry.attacks || []), { count: "", name: "", bonus: "", weapon: false, damage: "", extra: "", effect: "" }])}>＋ Adicionar ataque</button></div>
        {(entry.attacks || []).map((attack, index) => <div className="attack-row creature-attack-row" key={attack.id || index}><Field label="Nº de ataques"><input value={attack.count || ""} onChange={event => attackUpdate(index, "count", event.target.value)} /></Field><Field label="Tipo de ataque" className="attack-name"><input value={attack.name || ""} onChange={event => attackUpdate(index, "name", event.target.value)} /></Field><Field label="BA"><input value={attack.bonus || ""} onChange={event => attackUpdate(index, "bonus", event.target.value)} /></Field><label className="weapon-field"><input type="checkbox" checked={Boolean(attack.weapon)} onChange={event => attackUpdate(index, "weapon", event.target.checked)} /> Arma</label><Field label="Dano"><input value={attack.damage || ""} onChange={event => attackUpdate(index, "damage", event.target.value)} /></Field><Field label="Bônus no dano"><input value={attack.extra || ""} onChange={event => attackUpdate(index, "extra", event.target.value)} /></Field><Field label="Efeito"><input value={attack.effect || ""} onChange={event => attackUpdate(index, "effect", event.target.value)} /></Field><button type="button" aria-label="Remover ataque" className="remove-attack" onClick={() => update("attacks", entry.attacks.filter((_, current) => current !== index))}>×</button></div>)}
      </section>
    </>}

    <section className="editor-section last-section"><div className="section-heading"><div><span className="eyebrow">{isMonster ? "06" : isRace || isClass || isGear || isSpell ? "03" : "02"} / NARRATIVA</span><h2>{isRace ? "Descrição da raça" : isClass ? "Apresentação e restrições" : "Descrição"}</h2><p>Organize o conteúdo em partes para facilitar a leitura.</p></div><span className="section-symbol">❧</span></div>
      {!isRace && !isClass && <div className="description-tip"><span aria-hidden="true">ⓘ</span><p><strong>Dica:</strong> use a barra para formatar títulos, listas, citações, links, negrito e itálico.</p></div>}
      {descriptionSections.map(([label, help, key]) => <Field key={key} label={label} help={help}><RichTextEditor key={`${entry.id}:${key}`} value={entry[key] || ""} onChange={value => update(key, value)} font={entry.descriptionFont || "georgia"} fontFamily={descriptionFontFamily(entry.descriptionFont)} onFontChange={font => update("descriptionFont", font)} minHeight="220px" /></Field>)}
    </section>
  </div>;
}
