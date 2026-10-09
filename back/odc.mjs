export const categories = [
  { id: "monstros", label: "Monstros", icon: "◈" },
  { id: "racas", label: "Raças", icon: "♙" },
  { id: "classes", label: "Classes", icon: "⚔" },
  { id: "equipamentos", label: "Equipamentos", icon: "⬡" },
  { id: "magias", label: "Magias", icon: "✳" },
];

export const descriptionFonts = [
  { id: "georgia", name: "Georgia", css: "Georgia, serif" },
  { id: "arial", name: "Arial", css: "Arial, sans-serif" },
  { id: "trebuchet", name: "Trebuchet MS", css: '"Trebuchet MS", sans-serif' },
  { id: "verdana", name: "Verdana", css: "Verdana, sans-serif" },
  { id: "courier", name: "Courier New", css: '"Courier New", monospace' },
];

export const descriptionFontFamily = (id) => descriptionFonts.find(font => font.id === id)?.css || descriptionFonts[0].css;

export function blankEntry(type = "monstros") {
  const id = globalThis.crypto?.randomUUID?.() || `odc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return {
    id, importId: `odc-${id.slice(0, 8)}`, type, name: "", subtitle: "", image: "",
    concept: "", size: "", alignment: "", xp: "", habitats: [],
    movement: "", infravision: "", raceTraits: "", raceAbilities: "", languages: "",
    classKind: "", baseClass: "", classHitDie: "", highLevelHpBonus: "", primeAttribute: "", requirements: "", baProgression: "", jpProgression: "", xpProgression: "", classLevels: [], raceRestrictions: "", alignmentRestrictions: "", weaponRestrictions: "", armorRestrictions: "", magicItemRestrictions: "",
    equipmentType: "", price: "", weight: "", damage: "", properties: "",
    spellLevel: "", school: "", range: "", duration: "", components: "", target: "", jp: "", reverse: false,
    hd: "", hpBonus: "", hp: "", ac: "", morale: "", treasure: "", encounterQuantity: "", lairEncounterQuantity: "", lairTreasure: "", movementCave: "", movementClimb: "", movementSwim: "", movementFly: "", movementOther: "",
    createToken: type === "monstros", tokenFrameColor: "#133DD8", tokenImage: "", tokenCrop: { zoom: 1, x: 0, y: 0 }, imageVariants: [], tokenVariants: [],
    description: "", combat: "", finalDescription: "", descriptionFont: "georgia", updated: "", attacks: [], abilities: [], classSpells: [],
  };
}

const slug = (value) => String(value || "item").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
const allowedRichTags = new Set(["p", "div", "br", "h1", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "hr", "strong", "b", "em", "i", "s", "strike", "code", "pre", "u", "a", "sup", "sub"]);
export function richTextHTML(value) {
  const source = String(value || "").trim();
  if (!source) return "";
  if (!/<(?:p|div|br|h[1-6]|ul|ol|li|blockquote|hr|strong|b|em|i|s|strike|code|pre|u|a|sup|sub)(?:\s|\/?>)/i.test(source)) {
    return source.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>`).join("");
  }
  return source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (tag, rawName) => {
      const name = rawName.toLowerCase();
      if (!allowedRichTags.has(name)) return "";
      if (name === "a" && !tag.startsWith("</")) {
        const href = tag.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
        const safeHref = /^(https?:\/\/|mailto:|#|\/)/i.test(href.trim()) ? href.replace(/&/g, "&amp;").replace(/"/g, "&quot;") : "";
        return safeHref ? `<a href="${safeHref}" rel="noopener noreferrer">` : "<a>";
      }
      return tag.startsWith("</") ? `</${name}>` : `<${name}>`;
    });
}
const html = (text) => richTextHTML(text);
const fullDescriptionHTML = (entry) => {
  const sections = entry.type === "racas"
    ? [["Descrição", entry.description], ["Personalidade", entry.combat], ["Aventuras", entry.finalDescription]]
    : entry.type === "classes"
      ? [["Introdução", entry.description], ["Descrição", entry.combat], ["Restrições", entry.finalDescription]]
      : [["Descrição (Início)", entry.description], ["Descrição (Habilidades de Combate)", entry.combat], ["Descrição (Final)", entry.finalDescription]];
  const font = descriptionFontFamily(entry.descriptionFont);
  return sections.filter(([, value]) => String(value || "").trim()).map(([title, value]) => `<div style='font-family:${font}'><h2>${title}</h2>${html(value)}</div>`).join("");
};
const list = (value) => String(value || "").split(",").map(v => v.trim()).filter(Boolean);
const progression = (value) => String(value || "").split(",").map(v => v.trim()).filter(v => v !== "").map(v => Number(v)).filter(Number.isFinite);
const itemId = (entry) => slug(entry.importId || entry.id || entry.name);
const abilityId = (ability, index) => slug(ability.id || `${ability.name || "habilidade"}-${index + 1}`);
const spellSystem = (spell) => ({
  arcane: spell.school === "arcane" ? String(spell.spellLevel || "null") : "null",
  divine: spell.school === "divine" ? String(spell.spellLevel || "null") : "null",
  necromancer: spell.school === "necromancer" ? String(spell.spellLevel || "null") : "null",
  illusionist: spell.school === "illusionist" ? String(spell.spellLevel || "null") : "null",
  range: spell.range || "", duration: spell.duration || "", jp: spell.jp || "", reverse: Boolean(spell.reverse),
});

export function toFoundryJSON(entry) {
  const base = { id: itemId(entry), name: entry.name || "Sem nome", img: entry.image || "icons/svg/mystery-man.svg", flavor: html(entry.subtitle), description: fullDescriptionHTML(entry) };
  if (entry.type === "racas") return { races: [{ ...base,
    system: { movement: Number(entry.movement) || 0, infravision: Number(entry.infravision) || 0, alignment_tendency: ({ Ordeiro: "order", Neutro: "neutral", Caótico: "chaos" })[entry.alignment] || "neutral" },
    abilities: (entry.abilities || []).filter(a => a.name || a.description).map((a, i) => ({ id: abilityId(a, i), name: a.name || "Habilidade", description: html(a.description) })),
  }] };
  if (entry.type === "classes") {
    const legacyBa = progression(entry.baProgression), legacyJp = progression(entry.jpProgression), legacyXp = progression(entry.xpProgression);
    const rows = Array.isArray(entry.classLevels) && entry.classLevels.length ? entry.classLevels : Array.from({ length: Math.max(legacyBa.length, legacyJp.length, legacyXp.length) }, (_, index) => ({ level: index + 1, ba: legacyBa[index], jp: legacyJp[index], xp: legacyXp[index] }));
    const levels = {};
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index], level = String(Number(row.level) || index + 1);
      const numeric = value => value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : undefined;
      levels[level] = { ...(numeric(row.ba) !== undefined ? { ba: numeric(row.ba) } : {}), ...(numeric(row.jp) !== undefined ? { jp: numeric(row.jp) } : {}), ...(Number(level) > 1 && numeric(row.xp) !== undefined ? { xp: numeric(row.xp) } : {}), ...(row.hp ? { hp: row.hp } : {}) };
    }
    const toAbility = (a, i) => ({ id: abilityId(a, i), ...(Number(a.level) > 0 ? { level: Number(a.level) } : {}), name: a.name || "Habilidade", description: html(a.description) });
    return { classes: [{ ...base,
      system: { hp: Number(entry.classHitDie) || 0, high_level_hp_bonus: Number(entry.highLevelHpBonus) || 0, ...(entry.classKind ? { kind: entry.classKind } : {}), ...(entry.baseClass ? { base_class: entry.baseClass } : {}), levels,
        restrictions: { alignments: list(entry.alignmentRestrictions), races: list(entry.raceRestrictions) },
        equipment_restrictions: { weapons: entry.weaponRestrictions || "", armors: entry.armorRestrictions || "", magic_items: entry.magicItemRestrictions || "" } },
      abilities: (entry.abilities || []).filter(a => a.name || a.description).map(toAbility),
      spells: (entry.classSpells || []).filter(s => s.name || s.description).map((s, i) => ({ id: abilityId(s, i), name: s.name || "Magia", description: html(s.description), system: spellSystem(s) })),
    }] };
  }
  if (entry.type === "magias") return { spells: [{ id: itemId(entry), name: entry.name || "Sem nome", description: fullDescriptionHTML(entry), system: spellSystem(entry) }] };
  return { [entry.type]: [{ ...base, system: { ...entry } }] };
}
